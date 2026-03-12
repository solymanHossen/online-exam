import { Head } from '@inertiajs/react';

import { BatchForm } from '@/Components/domain/academic/BatchForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/hooks/useTranslation';
import type { Batch } from '@/types/models';

interface BatchEditPageProps {
    batch: Batch;
}

export default function BatchEditPage({ batch }: BatchEditPageProps) {
    const { t } = useTranslation();

    return (
        <AdminLayout header={<span>{t('admin.batches.edit.breadcrumb', {}, 'Edit Batch')}</span>}>
            <Head title={t('admin.batches.edit.title', {}, 'Edit Batch')} />

            <BatchForm
                batch={batch}
                submitRoute={route('admin.batches.update', batch.id)}
                submitMethod="put"
                title={t('admin.batches.edit.heading', {}, 'Refine batch details')}
                description={t('admin.batches.edit.description', {}, 'Update the academic metadata and lifecycle state of this batch.')}
                submitLabel={t('admin.batches.edit.submit', {}, 'Save changes')}
                cancelHref={route('admin.batches.index')}
            />
        </AdminLayout>
    );
}
