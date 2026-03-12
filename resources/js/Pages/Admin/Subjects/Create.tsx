import { Head } from '@inertiajs/react';

import { SubjectForm } from '@/Components/domain/academic/SubjectForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/hooks/useTranslation';
import type { MultiSelectOption } from '@/Components/domain/academic/MultiSelectDropdown';

interface SubjectCreatePageProps {
    availableBatches: Array<{
        id: string;
        name: string;
        description?: string | null;
    }>;
}

export default function SubjectCreatePage({ availableBatches }: SubjectCreatePageProps) {
    const { t } = useTranslation();

    const batchOptions: MultiSelectOption[] = availableBatches.map((batch) => ({
        id: batch.id,
        label: batch.name,
        description: batch.description,
    }));

    return (
        <AdminLayout header={<span>{t('admin.subjects.create.breadcrumb', {}, 'Create Subject')}</span>}>
            <Head title={t('admin.subjects.create.title', {}, 'Create Subject')} />

            <SubjectForm
                batchOptions={batchOptions}
                submitRoute={route('admin.subjects.store')}
                submitMethod="post"
                title={t('admin.subjects.create.heading', {}, 'Create an academic subject')}
                description={t('admin.subjects.create.description', {}, 'Connect a new subject with the right batches for a premium curriculum experience.')}
                submitLabel={t('admin.subjects.create.submit', {}, 'Create subject')}
                cancelHref={route('admin.subjects.index')}
            />
        </AdminLayout>
    );
}
