import { FeaturesSection } from '@/Components/domain/frontend/FeaturesSection';
import { HeroSection } from '@/Components/domain/frontend/HeroSection';
import { HowItWorks } from '@/Components/domain/frontend/HowItWorks';
import { PricingSection } from '@/Components/domain/frontend/PricingSection';
import { Testimonials } from '@/Components/domain/frontend/Testimonials';
import FrontendLayout from '@/Layouts/FrontendLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { Head } from '@inertiajs/react';

interface WelcomeProps {
    canLogin: boolean;
    canRegister: boolean;
}

export default function Welcome({ canLogin, canRegister }: WelcomeProps) {
    const { t } = useTranslation();

    return (
        <FrontendLayout canLogin={canLogin} canRegister={canRegister}>
            <Head title={t('frontend.meta.welcome_title', {}, 'Online Exam Platform')} />

            <HeroSection />

            <div id="features">
                <FeaturesSection />
            </div>

            <HowItWorks />
            <PricingSection />

            <div id="contact">
                <Testimonials />
            </div>
        </FrontendLayout>
    );
}
