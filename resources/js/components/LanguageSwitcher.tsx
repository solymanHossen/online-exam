import { router } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ar', name: 'العربية' },
    { code: 'bn', name: 'বাংলা' },
];

export function LanguageSwitcher() {
    const { locale } = useTranslation();

    const switchLanguage = (langCode: string) => {
        if (locale === langCode) return;

        router.post(
            route('locale.update'),
            { locale: langCode },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Force a full reload to apply language changes if necessary
                    // or let Inertia handle the reactive updates via shared props
                    if (langCode === 'ar' || locale === 'ar') {
                        // If switching to or from RTL, a full reload might be safer for layout
                        window.location.reload();
                    }
                },
            }
        );
    };

    const currentLangName = languages.find((l) => l.code === locale)?.name || 'Language';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 px-0">
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={`cursor-pointer ${locale === lang.code ? 'bg-accent/50 font-medium' : ''}`}
                    >
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
