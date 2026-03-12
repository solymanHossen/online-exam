import { Head } from '@inertiajs/react';

import { SubjectForm } from '@/Components/domain/academic/SubjectForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/hooks/useTranslation';
import type { MultiSelectOption } from '@/Components/domain/academic/MultiSelectDropdown';
import type { Subject } from '@/types/models';

interface SubjectEditPageProps {
    subject: Subject;
    availableBatches: Array<{
        id: string;
        name: string;
        description?: string | null;
    }>;
}

export default function SubjectEditPage({ subject, availableBatches }: SubjectEditPageProps) {
    const { t } = useTranslation();

    const batchOptions: MultiSelectOption[] = availableBatches.map((batch) => ({
        id: batch.id,
        label: batch.name,
        description: batch.description,
    }));

    return (
        <AdminLayout header={<span>{t('admin.subjects.edit.breadcrumb', {}, 'Edit Subject')}</span>}>
            <Head title={t('admin.subjects.edit.title', {}, 'Edit Subject')} />

            <SubjectForm
                subject={subject}
                batchOptions={batchOptions}
                submitRoute={route('admin.subjects.update', subject.id)}
                submitMethod="put"
                title={t('admin.subjects.edit.heading', {}, 'Refine subject details')}
                description={t('admin.subjects.edit.description', {}, 'Update subject metadata and keep chapter planning aligned.')}
                submitLabel={t('admin.subjects.edit.submit', {}, 'Save changes')}
                cancelHref={route('admin.subjects.index')}
            />
        </AdminLayout>
    );
}
