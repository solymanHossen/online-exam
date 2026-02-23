import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea";

const questionSchema = z.object({
    subject_id: z.string().min(1, "Subject is required"),
    chapter_id: z.string().min(1, "Chapter is required"),
    question_text: z.string().min(5, "Question text must be at least 5 characters"),
    explanation: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    marks: z.coerce.number().min(0),
    negative_marks: z.coerce.number().min(0),
    question_image: z.any().optional(),
    options: z.array(z.object({
        option_text: z.string().min(1, "Option text is required"),
        is_correct: z.boolean().default(false),
        option_image: z.any().optional(),
    })).min(2, "At least two options are required")
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export default function QuestionBuilder({ subjects, chapters, question }: any) {
    const isEditing = !!question;

    const defaultOptions = question?.options && question.options.length > 0
        ? question.options.map((opt: any) => ({
            option_text: opt.option_text || '',
            is_correct: !!opt.is_correct,
            option_image: undefined
        }))
        : [
            { option_text: '', is_correct: false, option_image: undefined },
            { option_text: '', is_correct: false, option_image: undefined },
        ];

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(questionSchema) as any,
        defaultValues: {
            subject_id: question?.subject_id || '',
            chapter_id: question?.chapter_id || '',
            question_text: question?.question_text || '',
            explanation: question?.explanation || undefined,
            difficulty: question?.difficulty || 'medium',
            marks: question?.marks ? Number(question.marks) : 1,
            negative_marks: question?.negative_marks ? Number(question.negative_marks) : 0,
            question_image: undefined,
            options: defaultOptions
        },
    });

    const { fields, append, remove } = useFieldArray({
        name: "options",
        control: form.control,
    });

    const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(question?.question_image ? `/storage/${question.question_image}` : null);
    const [optionImagePreviews, setOptionImagePreviews] = useState<Record<number, string | null>>({});

    const handleQuestionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('question_image', file);
            setQuestionImagePreview(URL.createObjectURL(file));
        }
    };

    const handleOptionImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue(`options.${index}.option_image`, file);
            setOptionImagePreviews(prev => ({ ...prev, [index]: URL.createObjectURL(file) }));
        }
    };

    const onSubmit = (data: QuestionFormValues) => {
        const formData = new FormData();

        formData.append('subject_id', data.subject_id);
        formData.append('chapter_id', data.chapter_id);
        formData.append('question_text', data.question_text);
        if (data.explanation) formData.append('explanation', data.explanation);
        formData.append('difficulty', data.difficulty);
        formData.append('marks', data.marks.toString());
        formData.append('negative_marks', data.negative_marks.toString());

        if (data.question_image instanceof File) {
            formData.append('question_image', data.question_image);
        }

        data.options.forEach((option, index) => {
            formData.append(`options[${index}][option_text]`, option.option_text);
            formData.append(`options[${index}][is_correct]`, option.is_correct ? '1' : '0');

            if (option.option_image instanceof File) {
                formData.append(`options[${index}][option_image]`, option.option_image);
            }
        });

        if (isEditing) {
            formData.append('_method', 'PUT');
            router.post(route('admin.questions.update', question.id), formData);
        } else {
            router.post(route('admin.questions.store'), formData);
        }
    };

    return (
        <AdminLayout header={isEditing ? 'Edit Question' : 'Build Question'}>
            <Head title={isEditing ? 'Edit Question' : 'Build Question'} />

            <div className="max-w-4xl mx-auto py-6">
                <div className="bg-card text-card-foreground shadow-sm rounded-lg border p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold tracking-tight">Question Builder</h2>
                        <p className="text-muted-foreground text-sm">Create an interactive question with multiple options and media upload support.</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((data) => onSubmit(data as QuestionFormValues))} className="space-y-6">
                            {/* Academic Alignment */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-border">
                                <FormField
                                    control={form.control}
                                    name="subject_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Subject" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {subjects?.map((s: any) => (
                                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="chapter_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Chapter</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Chapter" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {chapters?.map((c: any) => (
                                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Question Details */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="question_text"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Question Body</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Type your question here..."
                                                    className="min-h-[100px] text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormItem>
                                    <FormLabel>Question Image (Optional)</FormLabel>
                                    <div className="flex items-center gap-4">
                                        <Button type="button" variant="outline" onClick={() => document.getElementById('q-image-upload')?.click()}>
                                            <ImageIcon className="h-4 w-4 mr-2" /> Upload Image
                                        </Button>
                                        <Input
                                            id="q-image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleQuestionImageChange}
                                        />
                                        {questionImagePreview && (
                                            <div className="relative h-16 w-16 rounded overflow-hidden border">
                                                <img src={questionImagePreview} alt="Preview" className="object-cover w-full h-full" />
                                            </div>
                                        )}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="difficulty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Difficulty</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Level" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="easy">Easy</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="hard">Hard</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="marks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Correct Reward (Marks)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.5" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="negative_marks"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Penalty (Negative Marks)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.5" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="explanation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Explanation (Shown after exam)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Explain the correct answer..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Options List */}
                            <div className="space-y-4 pt-6 mt-6 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold tracking-tight">Answer Options</h3>
                                    <Button type="button" variant="secondary" onClick={() => append({ option_text: '', is_correct: false })}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Option
                                    </Button>
                                </div>

                                {fields.map((field, index) => (
                                    <div key={field.id} className={`p-4 rounded-lg border flex gap-4 transition-colors ${form.watch(`options.${index}.is_correct` as const) ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900/50' : 'bg-background hover:bg-muted/50'}`}>

                                        <FormField
                                            control={form.control}
                                            name={`options.${index}.is_correct` as const}
                                            render={({ field: checkboxField }) => (
                                                <FormItem className="flex flex-col items-center justify-center pt-2">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={checkboxField.value}
                                                            onCheckedChange={checkboxField.onChange}
                                                            className="h-5 w-5 rounded-full data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex-1 space-y-3">
                                            <FormField
                                                control={form.control}
                                                name={`options.${index}.option_text` as const}
                                                render={({ field: inputField }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder={`Option ${index + 1}`} {...inputField} className="text-base" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex items-center gap-4">
                                                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById(`o-image-upload-${index}`)?.click()}>
                                                    <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Add Image
                                                </Button>
                                                <Input
                                                    id={`o-image-upload-${index}`}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleOptionImageChange(index, e)}
                                                />
                                                {optionImagePreviews[index] && (
                                                    <div className="relative h-10 w-10 rounded overflow-hidden border">
                                                        <img src={optionImagePreviews[index]!} alt="Preview" className="object-cover w-full h-full" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            disabled={fields.length <= 2}
                                            className="text-muted-foreground hover:text-destructive shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {form.formState.errors.options?.root && (
                                    <p className="text-sm font-medium text-destructive">{form.formState.errors.options.root.message}</p>
                                )}
                            </div>

                            <div className="flex justify-end pt-6 border-t border-border">
                                <Button type="submit" size="lg" disabled={form.formState.isSubmitting} className="min-w-[150px]">
                                    {form.formState.isSubmitting ? 'Saving Question...' : 'Save Question Record'}
                                </Button>
                            </div>

                        </form>
                    </Form>
                </div>
            </div>
        </AdminLayout>
    );
}
