import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Tracks Inertia navigation state for lightweight loading placeholders.
 */
export function useNavigationProgress() {
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', () => setIsNavigating(true));
        const removeFinish = router.on('finish', () => setIsNavigating(false));
        const removeError = router.on('error', () => setIsNavigating(false));
        const removeInvalid = router.on('invalid', () => setIsNavigating(false));
        const removeException = router.on('exception', () => setIsNavigating(false));

        return () => {
            removeStart();
            removeFinish();
            removeError();
            removeInvalid();
            removeException();
        };
    }, []);

    return isNavigating;
}
