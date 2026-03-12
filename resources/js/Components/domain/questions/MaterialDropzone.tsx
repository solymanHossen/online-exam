import { FileText, ImagePlus, LoaderCircle, Paperclip, Trash2, UploadCloud } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { Button } from '@/Components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/Card';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export interface MaterialUploadItem {
    id: string;
    file: File;
    title: string;
    previewUrl: string | null;
    progress: number;
    mimeType: string;
}

interface MaterialDropzoneProps {
    items: MaterialUploadItem[];
    onFilesSelected: (files: File[]) => void;
    onRemove: (id: string) => void;
    disabled?: boolean;
    overallProgress?: number | null;
}

function formatBytes(size: number) {
    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function MaterialDropzone({
    items,
    onFilesSelected,
    onRemove,
    disabled = false,
    overallProgress = null,
}: MaterialDropzoneProps) {
    const { t } = useTranslation();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) {
            return;
        }

        onFilesSelected(acceptedFiles);
    }, [onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        disabled,
        multiple: true,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
            'application/pdf': ['.pdf'],
        },
    });

    return (
        <Card className="rounded-3xl border-border/60 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">{t('admin.questions.materials_title', {}, 'Question materials')}</CardTitle>
                <CardDescription>{t('admin.questions.materials_hint', {}, 'Attach reference images or PDFs with drag-and-drop support.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div
                    {...getRootProps()}
                    className={cn(
                        'rounded-3xl border border-dashed p-8 text-center transition-all duration-200',
                        isDragActive
                            ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                            : 'border-border bg-muted/10 hover:border-primary/40 hover:bg-primary/5',
                        disabled && 'cursor-not-allowed opacity-60',
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
                        <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                            <UploadCloud className="h-8 w-8" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-base font-semibold text-foreground">
                                {isDragActive
                                    ? t('admin.questions.materials_drop_active', {}, 'Drop files to attach them')
                                    : t('admin.questions.materials_drop_idle', {}, 'Drag materials here or click to browse')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {t('admin.questions.materials_supported', {}, 'Supports PNG, JPG, WEBP, GIF, and PDF documents.')}
                            </p>
                        </div>
                    </div>
                </div>

                {overallProgress !== null ? (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <div className="flex items-center gap-2 text-foreground">
                                <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                                {t('admin.questions.materials_uploading', {}, 'Uploading attachments with question submission')}
                            </div>
                            <span className="font-semibold text-primary">{overallProgress}%</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary/10">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${overallProgress}%` }} />
                        </div>
                    </div>
                ) : null}

                {items.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => {
                            const isImage = item.mimeType.startsWith('image/');
                            const isPdf = item.mimeType === 'application/pdf';

                            return (
                                <div key={item.id} className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
                                    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted/20">
                                        {isImage && item.previewUrl ? (
                                            <img src={item.previewUrl} alt={item.title} className="h-full w-full object-cover" />
                                        ) : isPdf ? (
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <FileText className="h-10 w-10 text-primary" />
                                                <span className="text-xs font-medium uppercase tracking-[0.18em]">PDF</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                <Paperclip className="h-10 w-10 text-primary" />
                                                <span className="text-xs font-medium uppercase tracking-[0.18em]">File</span>
                                            </div>
                                        )}
                                        <div className="absolute left-3 top-3 rounded-full bg-background/90 px-2 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">
                                            {formatBytes(item.file.size)}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute right-3 top-3 h-8 w-8 rounded-full"
                                            onClick={() => onRemove(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">{t('admin.questions.remove_material', {}, 'Remove material')}</span>
                                        </Button>
                                    </div>
                                    <div className="space-y-3 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                                {isImage ? <ImagePlus className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">{item.mimeType}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{t('admin.questions.preparing_preview', {}, 'Preparing preview')}</span>
                                                <span>{item.progress}%</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${item.progress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
