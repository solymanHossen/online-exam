// Task 3: Timezone Best Practices (Frontend)
export function formatLocalTime(utcString: string | null | undefined, localeStr = 'en-US'): string {
    if (!utcString) return 'N/A';
    try {
        // The appending of 'Z' guarantees JS parses it as UTC if missing, though Laravel should append it.
        const date = new Date(utcString.endsWith('Z') ? utcString : `${utcString}Z`);

        return new Intl.DateTimeFormat(localeStr, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch (e) {
        return 'Invalid Date';
    }
}
