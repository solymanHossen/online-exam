import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pageMap: Record<string, string> = {
            Dashboard: 'Frontend/Dashboard',
            Welcome: 'Frontend/Welcome',
            'Profile/Edit': 'Auth/Profile/Edit',
        };

        const normalizedName = name.startsWith('Install/')
            ? `Frontend/${name}`
            : (pageMap[name] ?? name);

        return resolvePageComponent(
            `./Pages/${normalizedName}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
});
