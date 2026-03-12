import { EditorContent, useEditor } from '@tiptap/react';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Heading1,
    Heading2,
    Italic,
    List,
    ListOrdered,
    Quote,
    Redo2,
    Undo2,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useEffect } from 'react';

import { Button } from '@/Components/ui/Button';
import { cn } from '@/lib/utils';

interface ToolbarAction {
    id: string;
    icon: ComponentType<{ className?: string }>;
    label: string;
    isActive?: () => boolean;
    action: () => void;
}

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    className?: string;
    minHeightClassName?: string;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder,
    className,
    minHeightClassName = 'min-h-[220px]',
}: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2],
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        editorProps: {
            attributes: {
                class: cn(
                    'question-editor prose prose-sm max-w-none px-4 py-4 text-foreground outline-none dark:prose-invert',
                    minHeightClassName,
                ),
            },
        },
        onUpdate: ({ editor: currentEditor }) => {
            onChange(currentEditor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        const currentHtml = editor.getHTML();
        if (value !== currentHtml) {
            editor.commands.setContent(value || '', { emitUpdate: false });
        }
    }, [editor, value]);

    if (!editor) {
        return (
            <div className={cn('rounded-2xl border border-border bg-background', className)}>
                <div className="grid grid-cols-4 gap-2 border-b border-border/60 p-3 sm:grid-cols-8">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="h-9 rounded-lg bg-muted/70" />
                    ))}
                </div>
                <div className={cn('rounded-b-2xl bg-background', minHeightClassName)} />
            </div>
        );
    }

    const actions: ToolbarAction[] = [
        {
            id: 'bold',
            icon: Bold,
            label: 'Bold',
            isActive: () => editor.isActive('bold'),
            action: () => editor.chain().focus().toggleBold().run(),
        },
        {
            id: 'italic',
            icon: Italic,
            label: 'Italic',
            isActive: () => editor.isActive('italic'),
            action: () => editor.chain().focus().toggleItalic().run(),
        },
        {
            id: 'h1',
            icon: Heading1,
            label: 'Heading 1',
            isActive: () => editor.isActive('heading', { level: 1 }),
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
            id: 'h2',
            icon: Heading2,
            label: 'Heading 2',
            isActive: () => editor.isActive('heading', { level: 2 }),
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
            id: 'bullet',
            icon: List,
            label: 'Bullet list',
            isActive: () => editor.isActive('bulletList'),
            action: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
            id: 'ordered',
            icon: ListOrdered,
            label: 'Ordered list',
            isActive: () => editor.isActive('orderedList'),
            action: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            id: 'quote',
            icon: Quote,
            label: 'Quote',
            isActive: () => editor.isActive('blockquote'),
            action: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
            id: 'undo',
            icon: Undo2,
            label: 'Undo',
            action: () => editor.chain().focus().undo().run(),
        },
        {
            id: 'redo',
            icon: Redo2,
            label: 'Redo',
            action: () => editor.chain().focus().redo().run(),
        },
    ];

    return (
        <div className={cn('overflow-hidden rounded-2xl border border-border bg-background shadow-sm', className)}>
            <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/20 p-3">
                {actions.map((item) => {
                    const Icon = item.icon;
                    const active = item.isActive?.() ?? false;

                    return (
                        <Button
                            key={item.id}
                            type="button"
                            variant={active ? 'default' : 'outline'}
                            size="sm"
                            className="rounded-xl"
                            onClick={item.action}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="sr-only">{item.label}</span>
                        </Button>
                    );
                })}
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
