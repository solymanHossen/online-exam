import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export function useTranslation() {
    const { translations = {}, locale = 'en' } = usePage<PageProps>().props;

    const t = (
        key: string,
        replacements: Record<string, string | number> = {},
        fallback?: string,
    ) => {
        let translation = translations[key] ?? fallback ?? key;

        Object.keys(replacements).forEach((replacementKey) => {
            const regex = new RegExp(`:${replacementKey}`, 'g');
            translation = translation.replace(regex, String(replacements[replacementKey]));
        });

        return translation;
    };

    return { t, locale, translations };
}
