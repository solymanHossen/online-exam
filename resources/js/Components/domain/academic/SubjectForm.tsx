import { Link, useForm } from '@inertiajs/react';
import { BookOpenText, LoaderCircle, Save } from 'lucide-react';

import { MultiSelectDropdown, type MultiSelectOption } from '@/Components/domain/academic/MultiSelectDropdown';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Textarea } from '@/Components/ui/Textarea';
import { useTranslation } from '@/hooks/useTranslation';
import type { Subject } from '@/types/models';

export interface SubjectFormData {
    name: string;
    code: string;
    description: string;
    batch_ids: string[];
}

interface SubjectFormProps {
    subject?: Subject;
    batchOptions: MultiSelectOption[];
    submitRoute: string;
    submitMethod: 'post' | 'put';
    title: string;
    description: string;
    submitLabel: string;
    cancelHref: string;
}

function getInitialData(subject?: Subject): SubjectFormData {
    return {
        name: subject?.name ?? '',
        code: subject?.code ?? '',
        description: subject?.description ?? '',
        batch_ids: subject?.batch_ids ?? [],
    };
}

export function SubjectForm({
    subject,
    batchOptions,
    submitRoute,
    submitMethod,
    title,
    description,
    submitLabel,
    cancelHref,
}: SubjectFormProps) {
    const { t } = useTranslation();
    const form = useForm<SubjectFormData>(getInitialData(subject));

    const validate = () => {
        let isValid = true;
        form.clearErrors();

        if (form.data.name.trim().length < 2) {
            form.setError('name', t('admin.subjects.validation.name', {}, 'Subject name must be at least 2 characters.'));
            isValid = false;
        }

        if (form.data.code.trim().length < 2) {
            form.setError('code', t('admin.subjects.validation.code', {}, 'Subject code must be at least 2 characters.'));
            isValid = false;
        }

        if (batchOptions.length > 0 && form.data.batch_ids.length === 0) {
            form.setError('batch_ids', t('admin.subjects.validation.batches', {}, 'Select at least one batch.'));
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = () => {
        if (!validate()) {
            return;
        }

        if (submitMethod === 'post') {
            form.post(submitRoute);
            return;
        }

        form.put(submitRoute);
    };

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="rounded-3xl border-border/60 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="subject-name">{t('admin.subjects.fields.name', {}, 'Subject name')}</Label>
                            <Input
                                id="subject-name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                placeholder={t('admin.subjects.placeholders.name', {}, 'e.g. Advanced Mathematics')}
                                className="rounded-xl"
                            />
                            {form.errors.name ? <p className="text-sm text-destructive">{form.errors.name}</p> : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject-code">{t('admin.subjects.fields.code', {}, 'Subject code')}</Label>
                            <Input
                                id="subject-code"
                                value={form.data.code}
                                onChange={(event) => form.setData('code', event.target.value.toUpperCase())}
                                placeholder={t('admin.subjects.placeholders.code', {}, 'e.g. MTH-401')}
                                className="rounded-xl uppercase"
                            />
                            {form.errors.code ? <p className="text-sm text-destructive">{form.errors.code}</p> : null}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="subject-description">{t('admin.subjects.fields.description', {}, 'Description')}</Label>
                            <Textarea
                                id="subject-description"
                                value={form.data.description}
                                onChange={(event) => form.setData('description', event.target.value)}
                                placeholder={t('admin.subjects.placeholders.description', {}, 'Outline the learning objective, curriculum segment, or faculty notes for this subject.')}
                                className="min-h-32 rounded-xl"
                            />
                            {form.errors.description ? <p className="text-sm text-destructive">{form.errors.description}</p> : null}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>{t('admin.subjects.fields.batches', {}, 'Assigned batches')}</Label>
                            <MultiSelectDropdown
                                label={t('admin.subjects.fields.batches', {}, 'Assigned batches')}
                                placeholder={t('admin.subjects.placeholders.batches', {}, 'Select one or more batches')}
                                helperText={t('admin.subjects.helpers.batches', {}, 'Each subject can be mapped to multiple academic batches.')}
                                options={batchOptions}
                                selectedValues={form.data.batch_ids}
                                onChange={(values) => form.setData('batch_ids', values)}
                                disabled={form.processing}
                            />
                            {form.errors.batch_ids ? <p className="text-sm text-destructive">{form.errors.batch_ids}</p> : null}
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-end">
                        <Button asChild type="button" variant="outline" className="rounded-xl">
                            <Link href={cancelHref}>{t('common.cancel', {}, 'Cancel')}</Link>
                        </Button>
                        <Button type="button" onClick={handleSubmit} disabled={form.processing} className="rounded-xl">
                            {form.processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {submitLabel}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/60 shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                            <BookOpenText className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{t('admin.subjects.sidebar.title', {}, 'Subject blueprint')}</CardTitle>
                            <CardDescription>{t('admin.subjects.sidebar.description', {}, 'Structure subjects clearly to improve question authoring and chapter management.')}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 leading-6">
                        {t('admin.subjects.sidebar.tip_1', {}, 'Use a consistent subject code for reporting, import workflows, and exam blueprints.')}
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 leading-6">
                        {t('admin.subjects.sidebar.tip_2', {}, 'Map subjects to the relevant batches so admins can build targeted learning journeys.')}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
