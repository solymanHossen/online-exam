import { BookOpenText, ChevronRight, FolderTree, Hash } from 'lucide-react';

import { Badge } from '@/Components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/Card';
import { Separator } from '@/Components/ui/Separator';
import type { Chapter, Subject } from '@/types/models';

interface SubjectChapterTreeProps {
    subjects: Subject[];
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
}

function renderChapterLabel(chapter: Chapter) {
    return (
        <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border/60 bg-background px-3 py-3">
            <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                <Hash className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{chapter.name}</p>
                    {typeof chapter.order === 'number' ? (
                        <Badge variant="outline" className="rounded-full">
                            #{chapter.order}
                        </Badge>
                    ) : null}
                </div>
                {chapter.description ? (
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{chapter.description}</p>
                ) : null}
            </div>
        </div>
    );
}

export function SubjectChapterTree({
    subjects,
    title,
    description,
    emptyTitle,
    emptyDescription,
}: SubjectChapterTreeProps) {
    return (
        <Card className="overflow-hidden rounded-3xl border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/60 bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <FolderTree className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
                {subjects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
                        <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
                    </div>
                ) : (
                    subjects.map((subject, index) => (
                        <div key={subject.id} className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                    <BookOpenText className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-base font-semibold text-foreground">{subject.name}</p>
                                        {subject.code ? (
                                            <Badge variant="secondary" className="rounded-full uppercase tracking-wide">
                                                {subject.code}
                                            </Badge>
                                        ) : null}
                                        <Badge variant="outline" className="rounded-full">
                                            {(subject.chapters ?? []).length}
                                        </Badge>
                                    </div>
                                    <div className="mt-3 grid gap-3 pl-0 md:pl-8">
                                        {(subject.chapters ?? []).length > 0 ? (
                                            (subject.chapters ?? []).map((chapter) => (
                                                <div key={chapter.id} className="flex items-start gap-3">
                                                    <ChevronRight className="mt-4 h-4 w-4 text-muted-foreground" />
                                                    <div className="flex-1">{renderChapterLabel(chapter)}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-border bg-muted/10 px-4 py-6 text-sm text-muted-foreground">
                                                {emptyDescription}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {index !== subjects.length - 1 ? <Separator /> : null}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
