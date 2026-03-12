import { Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Save, Sparkles } from 'lucide-react';

import { StatusToggle } from '@/Components/domain/academic/StatusToggle';
import { Button } from '@/Components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import { Textarea } from '@/Components/ui/Textarea';
import { useTranslation } from '@/hooks/useTranslation';
import type { Batch } from '@/types/models';

export interface BatchFormData {
    name: string;
    description: string;
    status: boolean;
    class_level: string;
    year: string;
}

interface BatchFormProps {
    batch?: Batch;
    submitRoute: string;
    submitMethod: 'post' | 'put';
    title: string;
    description: string;
    submitLabel: string;
    cancelHref: string;
}

function getInitialData(batch?: Batch): BatchFormData {
    return {
        name: batch?.name ?? '',
        description: batch?.description ?? '',
        status: batch?.status === undefined ? true : batch.status === 'active' || batch.status === true,
        class_level: batch?.class_level ?? '',
        year: batch?.year ? String(batch.year) : String(new Date().getFullYear()),
    };
}

export function BatchForm({
    batch,
    submitRoute,
    submitMethod,
    title,
    description,
    submitLabel,
    cancelHref,
}: BatchFormProps) {
    const { t } = useTranslation();
    const form = useForm<BatchFormData>(getInitialData(batch));

    const validate = () => {
        let isValid = true;
        form.clearErrors();

        if (form.data.name.trim().length < 2) {
            form.setError('name', t('admin.batches.validation.name', {}, 'Batch name must be at least 2 characters.'));
            isValid = false;
        }

        if (form.data.class_level.trim().length === 0) {
            form.setError('class_level', t('admin.batches.validation.class_level', {}, 'Class level is required.'));
            isValid = false;
        }

        const yearValue = Number(form.data.year);
        if (Number.isNaN(yearValue) || yearValue < 2000 || yearValue > 2100) {
            form.setError('year', t('admin.batches.validation.year', {}, 'Enter a valid academic year.'));
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
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="batch-name">{t('admin.batches.fields.name', {}, 'Batch name')}</Label>
                            <Input
                                id="batch-name"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                placeholder={t('admin.batches.placeholders.name', {}, 'e.g. 2026 Engineering Intake')}
                                className="rounded-xl"
                            />
                            {form.errors.name ? <p className="text-sm text-destructive">{form.errors.name}</p> : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="batch-class-level">{t('admin.batches.fields.class_level', {}, 'Class level')}</Label>
                            <Input
                                id="batch-class-level"
                                value={form.data.class_level}
                                onChange={(event) => form.setData('class_level', event.target.value)}
                                placeholder={t('admin.batches.placeholders.class_level', {}, 'e.g. Grade 12 / Advanced')}
                                className="rounded-xl"
                            />
                            {form.errors.class_level ? <p className="text-sm text-destructive">{form.errors.class_level}</p> : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="batch-year">{t('admin.batches.fields.year', {}, 'Academic year')}</Label>
                            <Input
                                id="batch-year"
                                type="number"
                                min={2000}
                                max={2100}
                                value={form.data.year}
                                onChange={(event) => form.setData('year', event.target.value)}
                                placeholder={t('admin.batches.placeholders.year', {}, '2026')}
                                className="rounded-xl"
                            />
                            {form.errors.year ? <p className="text-sm text-destructive">{form.errors.year}</p> : null}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="batch-description">{t('admin.batches.fields.description', {}, 'Description')}</Label>
                            <Textarea
                                id="batch-description"
                                value={form.data.description}
                                onChange={(event) => form.setData('description', event.target.value)}
                                placeholder={t('admin.batches.placeholders.description', {}, 'Add a premium overview for this batch, enrollment scope, and academic notes.')}
                                className="min-h-32 rounded-xl"
                            />
                            {form.errors.description ? <p className="text-sm text-destructive">{form.errors.description}</p> : null}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('admin.batches.fields.status', {}, 'Status')}</Label>
                        <StatusToggle
                            checked={form.data.status}
                            onCheckedChange={(checked) => form.setData('status', checked)}
                            activeLabel={t('admin.batches.status.active', {}, 'Active batch')}
                            inactiveLabel={t('admin.batches.status.inactive', {}, 'Inactive batch')}
                            disabled={form.processing}
                        />
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

            <Card className="rounded-3xl border-border/60 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{t('admin.batches.sidebar.title', {}, 'Premium batch setup')}</CardTitle>
                            <CardDescription>{t('admin.batches.sidebar.description', {}, 'Keep each cohort well defined for enrollment, exam targeting, and reporting.')}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                        <p className="font-semibold text-foreground">{t('admin.batches.sidebar.tip_1_title', {}, 'Suggested structure')}</p>
                        <p className="mt-2 leading-6">{t('admin.batches.sidebar.tip_1_body', {}, 'Use the batch name for session or intake, and keep class level specific for accurate academic segmentation.')}</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                        <p className="font-semibold text-foreground">{t('admin.batches.sidebar.tip_2_title', {}, 'Status toggle')}</p>
                        <p className="mt-2 leading-6">{t('admin.batches.sidebar.tip_2_body', {}, 'Inactive batches remain available for historical reporting while staying out of current workflows.')}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
