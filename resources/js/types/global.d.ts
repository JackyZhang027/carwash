import type { Auth } from '@/types/auth';
import type { AppSettings } from '@/types/carwash';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            appSettings: AppSettings;
            plAuthenticated: boolean;
            flash: { success?: string; error?: string };
            [key: string]: unknown;
        };
    }
}
