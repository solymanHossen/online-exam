import { Head } from '@inertiajs/react';

import { ChapterForm } from '@/Components/domain/academic/ChapterForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/hooks/useTranslation';
import type { Subject } from '@/types/models';

interface ChapterCreatePageProps {
    subjects: Subject[];
}

export default function ChapterCreatePage({ subjects }: ChapterCreatePageProps) {
    const { t } = useTranslation();

    return (
        <AdminLayout header={<span>{t('admin.chapters.create.breadcrumb', {}, 'Create Chapter')}</span>}>
            <Head title={t('admin.chapters.create.title', {}, 'Create Chapter')} />

            <ChapterForm
                subjects={subjects}
                submitRoute={route('admin.chapters.store')}
                submitMethod="post"
                title={t('admin.chapters.create.heading', {}, 'Create a nested chapter')}
                description={t('admin.chapters.create.description', {}, 'Attach a chapter to a subject and place it correctly in your curriculum hierarchy.')}
                submitLabel={t('admin.chapters.create.submit', {}, 'Create chapter')}
                cancelHref={route('admin.chapters.index')}
            />
        </AdminLayout>
    );
}
