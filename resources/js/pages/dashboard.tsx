import { Link } from '@inertiajs/react';
import { Car, Receipt, TrendingDown, TrendingUp } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { formatRp } from '@/lib/format';
import type { BreadcrumbItem } from '@/types';

type DashboardStats = {
    today_income: number;
    today_expense: number;
    today_transaction_count: number;
    draft_count: number;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];


export default function Dashboard({ stats }: { stats: DashboardStats }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
<div className="space-y-6 p-4">
                <h1 className="text-xl font-semibold">Dashboard</h1>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pendapatan Hari Ini</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">{formatRp(stats?.today_income ?? 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pengeluaran Hari Ini</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-red-600">{formatRp(stats?.today_expense ?? 0)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Transaksi Hari Ini</CardTitle>
                            <Receipt className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats?.today_transaction_count ?? 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Draft Belum Publish</CardTitle>
                            <Car className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-orange-600">{stats?.draft_count ?? 0}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href="/transactions"><Receipt className="mr-2 h-4 w-4" /> Input Transaksi</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/expenses"><TrendingDown className="mr-2 h-4 w-4" /> Input Pengeluaran</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
