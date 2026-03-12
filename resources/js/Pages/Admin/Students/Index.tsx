import { Head } from '@inertiajs/react';
import { Download, FileSpreadsheet, GraduationCap, Search, Users2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { StudentProfileSheet } from '@/Components/domain/students/StudentProfileSheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/Avatar';
import { Badge } from '@/Components/ui/Badge';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Checkbox } from '@/Components/ui/Checkbox';
import { Input } from '@/Components/ui/Input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/Select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/Table';
import { useTranslation } from '@/hooks/useTranslation';
import AdminLayout from '@/Layouts/AdminLayout';
import type { PaginatedData } from '@/types';
import type { StudentListItem } from '@/types/models';

interface StudentsIndexProps {
    students: PaginatedData<StudentListItem>;
}

type StatusFilter = 'all' | 'active' | 'inactive';

function getInitials(name?: string) {
    if (!name) {
        return 'ST';
    }

    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function exportCsv(rows: StudentListItem[]) {
    const csvRows = [
        ['Name', 'Email', 'Roll Number', 'Batches', 'Status', 'Total Exams Taken', 'Average Score'],
        ...rows.map((student) => [
            student.user?.name ?? '',
            student.user?.email ?? '',
            student.roll_number,
            (student.batches ?? []).map((batch) => batch.name).join(' | '),
            student.status,
            String(student.total_exams_taken ?? 0),
            String(student.average_score ?? 0),
        ]),
    ];

    const csvContent = csvRows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student-directory.csv';
    link.click();
    URL.revokeObjectURL(url);
}

export default function StudentsIndex({ students }: StudentsIndexProps) {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeStudent, setActiveStudent] = useState<StudentListItem | null>(null);

    const rows = students.data ?? [];

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();

        return rows.filter((student) => {
            const statusMatches = statusFilter === 'all' || student.status === statusFilter;
            if (!statusMatches) {
                return false;
            }

            if (!query) {
                return true;
            }

            const haystack = `${student.user?.name ?? ''} ${student.user?.email ?? ''} ${student.roll_number} ${(student.batches ?? []).map((batch) => batch.name).join(' ')}`.toLowerCase();
            return haystack.includes(query);
        });
    }, [rows, search, statusFilter]);

    const allFilteredSelected = filteredStudents.length > 0 && filteredStudents.every((student) => selectedIds.includes(student.id));
    const someFilteredSelected = filteredStudents.some((student) => selectedIds.includes(student.id));

    const metrics = useMemo(() => ({
        total: rows.length,
        active: rows.filter((student) => student.status === 'active').length,
        averageScore: rows.length > 0
            ? (rows.reduce((sum, student) => sum + Number(student.average_score ?? 0), 0) / rows.length).toFixed(1)
            : '0.0',
    }), [rows]);

    const toggleAllFiltered = () => {
        if (allFilteredSelected) {
            setSelectedIds((current) => current.filter((id) => !filteredStudents.some((student) => student.id === id)));
            return;
        }

        setSelectedIds((current) => Array.from(new Set([...current, ...filteredStudents.map((student) => student.id)])));
    };

    const toggleStudent = (studentId: string) => {
        setSelectedIds((current) => current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]);
    };

    const exportRows = selectedIds.length > 0
        ? filteredStudents.filter((student) => selectedIds.includes(student.id))
        : filteredStudents;

    return (
        <AdminLayout header={<span>{t('admin.students.index.breadcrumb', {}, 'Students')}</span>}>
            <Head title={t('admin.students.index.title', {}, 'Student Directory')} />

            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            {t('admin.students.index.heading', {}, 'Student directory')}
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                            {t('admin.students.index.description', {}, 'Browse learner profiles, inspect performance snapshots, and export curated directory data.')}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button variant="outline" className="rounded-xl" onClick={() => exportCsv(exportRows)}>
                            <Download className="h-4 w-4" />
                            {t('admin.students.export_csv', {}, 'Export to CSV')}
                        </Button>
                        <Button className="rounded-xl shadow-sm">
                            <Users2 className="h-4 w-4" />
                            {t('admin.students.create', {}, 'Add student')}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Users2 className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.students.metrics.total', {}, 'Visible students')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600"><GraduationCap className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.students.metrics.active', {}, 'Active learners')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.active}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600"><FileSpreadsheet className="h-5 w-5" /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('admin.students.metrics.average_score', {}, 'Average score')}</p>
                                <p className="text-2xl font-semibold text-foreground">{metrics.averageScore}%</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="overflow-hidden rounded-3xl border-border/60 shadow-sm">
                    <CardHeader className="gap-4 border-b border-border/60 bg-muted/20">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                                <CardTitle>{t('admin.students.table.title', {}, 'Student directory')}</CardTitle>
                                <CardDescription>{t('admin.students.table.description', {}, 'Bulk select records, export subsets, and open detailed student profiles in a slide-over.')}</CardDescription>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative min-w-[260px]">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('admin.students.table.search', {}, 'Search by name, email, roll, or batch')} className="rounded-xl pl-10" />
                                </div>
                                <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                                    <SelectTrigger className="w-full rounded-xl sm:w-[180px]">
                                        <SelectValue placeholder={t('admin.students.table.filter_status', {}, 'Filter status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('common.all', {}, 'All')}</SelectItem>
                                        <SelectItem value="active">{t('common.active', {}, 'Active')}</SelectItem>
                                        <SelectItem value="inactive">{t('common.inactive', {}, 'Inactive')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-12 px-6 py-4">
                                            <Checkbox
                                                checked={allFilteredSelected || (someFilteredSelected ? 'indeterminate' : false)}
                                                onCheckedChange={toggleAllFiltered}
                                                aria-label={t('admin.students.table.select_all', {}, 'Select all students')}
                                            />
                                        </TableHead>
                                        <TableHead className="px-6 py-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('admin.students.table.student', {}, 'Student')}</TableHead>
                                        <TableHead className="px-6 py-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('admin.students.table.batches', {}, 'Enrolled batches')}</TableHead>
                                        <TableHead className="px-6 py-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">{t('admin.students.table.status', {}, 'Status')}</TableHead>
                                        <TableHead className="px-6 py-4 text-xs uppercase tracking-[0.18em] text-muted-foreground text-right">{t('admin.students.table.exams', {}, 'Exams')}</TableHead>
                                        <TableHead className="px-6 py-4 text-xs uppercase tracking-[0.18em] text-muted-foreground text-right">{t('admin.students.table.average', {}, 'Avg score')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                                        const isSelected = selectedIds.includes(student.id);

                                        return (
                                            <TableRow
                                                key={student.id}
                                                className="cursor-pointer border-border/60 transition-colors hover:bg-muted/20"
                                                onClick={() => setActiveStudent(student)}
                                            >
                                                <TableCell className="px-6 py-4" onClick={(event) => event.stopPropagation()}>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleStudent(student.id)}
                                                        aria-label={t('admin.students.table.select_student', {}, 'Select student')}
                                                    />
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-11 w-11 border border-border shadow-sm">
                                                            <AvatarImage src={student.user?.avatar ?? undefined} alt={student.user?.name ?? student.roll_number} />
                                                            <AvatarFallback className="text-sm font-semibold">{getInitials(student.user?.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-semibold text-foreground">{student.user?.name ?? student.roll_number}</p>
                                                            <p className="text-sm text-muted-foreground">{student.user?.email ?? '—'}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <div className="flex max-w-sm flex-wrap gap-2">
                                                        {(student.batches ?? []).map((batch) => (
                                                            <Badge key={batch.id} variant="outline" className="rounded-full px-3 py-1">{batch.name}</Badge>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <Badge variant={student.status === 'active' ? 'secondary' : 'outline'} className="rounded-full px-3 py-1">
                                                        {student.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-right text-sm font-medium text-foreground">{student.total_exams_taken ?? 0}</TableCell>
                                                <TableCell className="px-6 py-4 text-right text-sm font-medium text-foreground">{student.average_score ?? 0}%</TableCell>
                                            </TableRow>
                                        );
                                    }) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="px-6 py-14 text-center">
                                                <div className="mx-auto max-w-md space-y-2">
                                                    <p className="text-base font-semibold text-foreground">{t('admin.students.table.empty_title', {}, 'No students found')}</p>
                                                    <p className="text-sm text-muted-foreground">{t('admin.students.table.empty_description', {}, 'Adjust filters or add a new student to populate the directory.')}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <StudentProfileSheet student={activeStudent} open={Boolean(activeStudent)} onOpenChange={(open) => !open && setActiveStudent(null)} />
        </AdminLayout>
    );
}
