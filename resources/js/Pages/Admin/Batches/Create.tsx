import { Head } from '@inertiajs/react';

import { BatchForm } from '@/Components/domain/academic/BatchForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/hooks/useTranslation';

export default function BatchCreatePage() {
    const { t } = useTranslation();

    return (
        <AdminLayout header={<span>{t('admin.batches.create.breadcrumb', {}, 'Create Batch')}</span>}>
            <Head title={t('admin.batches.create.title', {}, 'Create Batch')} />

            <BatchForm
                submitRoute={route('admin.batches.store')}
                submitMethod="post"
                title={t('admin.batches.create.heading', {}, 'Create a premium batch')}
                description={t('admin.batches.create.description', {}, 'Add a polished batch record for enrollment, academic grouping, and reporting workflows.')}
                submitLabel={t('admin.batches.create.submit', {}, 'Create batch')}
                cancelHref={route('admin.batches.index')}
            />
        </AdminLayout>
    );
}
