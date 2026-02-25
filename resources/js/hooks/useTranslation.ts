import { usePage } from '@inertiajs/react';

export function useTranslation() {
    const { translations, locale } = usePage().props as any;

    const t = (key: string, replacements: Record<string, string | number> = {}) => {
        let translation = (translations || {})[key] || key;

        Object.keys(replacements).forEach((replacementKey) => {
            const regex = new RegExp(`:${replacementKey}`, 'g');
            translation = translation.replace(regex, String(replacements[replacementKey]));
        });

        return translation;
    };

    return { t, locale: locale || 'en', translations: translations || {} };
}
