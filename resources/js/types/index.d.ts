export interface User {
    id: string;
    name: string;
    email: string;
    email_verified_at?: string;
    role_id?: string;
    phone?: string;
    avatar?: string;
    is_active?: boolean;
    last_login_at?: string;
    created_at?: string;
}

export interface PaginatedData<T> {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    locale: string;
    translations: Record<string, string>;
};
