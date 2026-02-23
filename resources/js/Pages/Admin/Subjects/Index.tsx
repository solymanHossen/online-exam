import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Plus, MoreHorizontal, FileEdit, Trash2, LibraryBig } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/ui/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Define TS types
interface Chapter {
    id: string;
    name: string;
    subject_id: string;
}

interface Subject {
    id: string;
    name: string;
    code: string;
    chapters: Chapter[];
    created_at: string;
}

interface Props {
    subjects: {
        data: Subject[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: any[];
        next_page_url: string | null;
        prev_page_url: string | null;
    };
}

// Validation Schema
const subjectSchema = z.object({
    name: z.string().min(2, { message: "Subject name must be at least 2 characters." }),
    code: z.string().min(2, { message: "Subject code must be at least 2 characters." }),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

export default function SubjectsIndex({ subjects }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    const form = useForm<SubjectFormValues>({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            name: '',
            code: '',
        },
    });

    const openDialog = (subject?: Subject) => {
        if (subject) {
            setEditingSubject(subject);
            form.reset({ name: subject.name, code: subject.code });
        } else {
            setEditingSubject(null);
            form.reset({ name: '', code: '' });
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        form.reset();
        setEditingSubject(null);
    };

    const onSubmit = (data: SubjectFormValues) => {
        if (editingSubject) {
            router.put(route('admin.subjects.update', editingSubject.id), data, {
                onSuccess: () => handleCloseDialog(),
            });
        } else {
            router.post(route('admin.subjects.store'), data, {
                onSuccess: () => handleCloseDialog(),
            });
        }
    };

    const deleteSubject = (id: string) => {
        if (confirm('Are you sure you want to delete this subject? All related chapters will be deleted.')) {
            router.delete(route('admin.subjects.destroy', id));
        }
    };

    const columns: Column<Subject>[] = [
        {
            header: "Subject Info",
            accessorKey: "name",
            cell: (row: Subject) => (
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <LibraryBig size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-foreground tracking-tight">{row.name}</span>
                        <span className="text-xs text-muted-foreground">Code: {row.code}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Chapters",
            cell: (row: Subject) => (
                <Badge variant={row.chapters?.length > 0 ? "secondary" : "outline"} className="font-medium">
                    {row.chapters?.length || 0} Chapters
                </Badge>
            )
        },
        {
            header: "Created",
            cell: (row: Subject) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString()}
                </span>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (row: Subject) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDialog(row)} className="cursor-pointer">
                                <FileEdit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteSubject(row.id)} className="text-destructive focus:text-destructive cursor-pointer">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <AdminLayout header="Academic Subjects">
            <Head title="Subjects & Chapters" />

            <div className="flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Subjects Map</h1>
                        <p className="text-sm text-muted-foreground">Manage your educational subjects and their relational chapters.</p>
                    </div>
                    <Button onClick={() => openDialog()} className="shadow-sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Subject
                    </Button>
                </div>

                {/* Data Table */}
                <DataTable
                    data={subjects}
                    columns={columns}
                    searchable
                    searchKey="name"
                    searchPlaceholder="Search subjects by name..."
                />

                {/* Create / Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
                            <DialogDescription>
                                {editingSubject ? 'Update the details for this subject.' : 'Create a new subject for the academic structure.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-2">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Advanced Mathematics" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject Code</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. MTH-401" {...field} className="uppercase" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="pt-4 flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={form.formState.isSubmitting}>
                                            {form.formState.isSubmitting ? 'Saving...' : 'Save Subject'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
