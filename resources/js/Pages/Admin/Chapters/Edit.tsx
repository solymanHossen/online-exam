import { Head } from '@inertiajs/react';

import { ChapterForm } from '@/Components/domain/academic/ChapterForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { useTranslation } from '@/hooks/useTranslation';
import type { Chapter, Subject } from '@/types/models';

interface ChapterEditPageProps {
    chapter: Chapter;
    subjects: Subject[];
}

export default function ChapterEditPage({ chapter, subjects }: ChapterEditPageProps) {
    const { t } = useTranslation();

    return (
        <AdminLayout header={<span>{t('admin.chapters.edit.breadcrumb', {}, 'Edit Chapter')}</span>}>
            <Head title={t('admin.chapters.edit.title', {}, 'Edit Chapter')} />

            <ChapterForm
                chapter={chapter}
                subjects={subjects}
                submitRoute={route('admin.chapters.update', chapter.id)}
                submitMethod="put"
                title={t('admin.chapters.edit.heading', {}, 'Refine chapter details')}
                description={t('admin.chapters.edit.description', {}, 'Keep chapter ordering, hierarchy, and summaries polished for a premium admin workflow.')}
                submitLabel={t('admin.chapters.edit.submit', {}, 'Save changes')}
                cancelHref={route('admin.chapters.index')}
            />
        </AdminLayout>
    );
}
