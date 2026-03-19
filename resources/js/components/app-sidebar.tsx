import { Link, usePage } from '@inertiajs/react';
import { BarChart3, Car, LayoutGrid, Receipt, Settings, TrendingDown, TrendingUp, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props;
    const isAdmin = auth.roles?.includes('admin');

    const groups = [
        {
            label: 'Transaksi',
            items: [
                { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
                { title: 'Transaksi', href: '/transactions', icon: Receipt },
                { title: 'Pengeluaran', href: '/expenses', icon: TrendingDown },
            ] as NavItem[],
        },
        {
            label: 'Master Data',
            items: [
                { title: 'Pricelist', href: '/services', icon: Car },
                ...(isAdmin ? [{ title: 'Pengguna', href: '/users', icon: Users }] : []),
            ] as NavItem[],
        },
        ...(isAdmin ? [{
            label: 'Laporan & Pengaturan',
            items: [
                { title: 'Profit & Loss', href: '/profit-loss', icon: BarChart3 },
                { title: 'Export', href: '/export', icon: TrendingUp },
                { title: 'Pengaturan', href: '/app-settings', icon: Settings },
            ] as NavItem[],
        }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={groups} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
