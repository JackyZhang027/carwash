import { router, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Lock, Trash2, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useState } from 'react';
import { PasswordVerifyModal } from '@/components/password-verify-modal';
import { ServerDataTable } from '@/components/server-data-table';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRp } from '@/lib/format';
import type { Expense, PLSummary, Transaction } from '@/types';

type Props = {
    summary: PLSummary;
    filters: { start_date: string; end_date: string };
};


export default function ProfitLossIndex({ summary, filters }: Props) {
    const [verified, setVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState<string | undefined>();
    const [password, setPassword] = useState('');

    const filterForm = useForm({ start_date: filters.start_date, end_date: filters.end_date });
    const [appliedFilters, setAppliedFilters] = useState(filters);
    const [deleteItem, setDeleteItem] = useState<{ type: 'transaction' | 'expense'; id: number } | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | undefined>();
    const [refreshKey, setRefreshKey] = useState(0);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        setVerifyError(undefined);

        try {
            const res = await fetch('/profit-loss/check-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
                    ),
                },
                credentials: 'same-origin',
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                setVerified(true);
                setPassword('');
            } else {
                const json = await res.json();
                setVerifyError(json.message ?? 'Password tidak valid.');
            }
        } catch {
            setVerifyError('Terjadi kesalahan. Coba lagi.');
        } finally {
            setVerifying(false);
        }
    };

    const applyFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setAppliedFilters({ start_date: filterForm.data.start_date, end_date: filterForm.data.end_date });
        filterForm.get('/profit-loss', { preserveState: true });
    };

    const handleDelete = (pwd: string) => {
        if (!deleteItem) return;
        const url = deleteItem.type === 'transaction'
            ? `/transactions/${deleteItem.id}`
            : `/expenses/${deleteItem.id}`;

        setDeleting(true);
        setDeleteError(undefined);
        router.delete(url, {
            data: { password: pwd },
            preserveState: true,
            onSuccess: () => {
                setDeleting(false);
                setDeleteItem(null);
                setRefreshKey((k) => k + 1);
            },
            onError: (errors) => {
                setDeleting(false);
                setDeleteError(errors.password ?? 'Terjadi kesalahan.');
            },
        });
    };

    const transactionColumns: ColumnDef<Transaction>[] = [
        { accessorKey: 'date', header: 'Tanggal', cell: ({ getValue }) => (getValue() as string).slice(0, 10) },
        { accessorKey: 'service_name', header: 'Layanan' },
        {
            accessorKey: 'vehicle_type',
            header: 'Kendaraan',
            cell: ({ getValue }) => getValue() === 'car' ? 'Mobil' : 'Motor',
        },
        { accessorKey: 'plate_no', header: 'No. Polisi', cell: ({ getValue }) => (getValue() as string) || '-' },
        {
            accessorKey: 'payment_method',
            header: 'Metode',
            cell: ({ getValue }) => <Badge variant="outline">{(getValue() as string).toUpperCase()}</Badge>,
        },
        {
            accessorKey: 'price',
            header: 'Harga',
            cell: ({ getValue }) => <span className="font-mono">{formatRp(getValue() as number)}</span>,
        },
        {
            accessorKey: 'adj_price',
            header: 'ADJ',
            cell: ({ getValue }) => <span className="font-mono">{formatRp(getValue() as number)}</span>,
        },
        {
            accessorKey: 'final_price',
            header: 'Total',
            cell: ({ getValue }) => <span className="font-mono font-medium">{formatRp(getValue() as number)}</span>,
        },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => (
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700"
                    onClick={() => setDeleteItem({ type: 'transaction', id: row.original.id })}>
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            ),
        },
    ];

    const expenseColumns: ColumnDef<Expense>[] = [
        { accessorKey: 'date', header: 'Tanggal', cell: ({ getValue }) => (getValue() as string).slice(0, 10) },
        { accessorKey: 'type', header: 'Jenis Pengeluaran' },
        {
            accessorKey: 'amount',
            header: 'Biaya',
            cell: ({ getValue }) => <span className="font-mono">{formatRp(getValue() as number)}</span>,
        },
        { accessorKey: 'note', header: 'Catatan', cell: ({ getValue }) => (getValue() as string) || '-' },
        {
            id: 'actions',
            header: '',
            enableSorting: false,
            cell: ({ row }) => (
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700"
                    onClick={() => setDeleteItem({ type: 'expense', id: row.original.id })}>
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            ),
        },
    ];

    const dtExtraParams = {
        start_date: appliedFilters.start_date,
        end_date: appliedFilters.end_date,
    };

    // Password gate — shown on every mount until verified
    if (!verified) {
        return (
            <AppLayout breadcrumbs={[{ title: 'Profit & Loss', href: '/profit-loss' }]}>
                <div className="flex min-h-[60vh] items-center justify-center p-4">
                    <Card className="w-full max-w-sm">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Laporan Profit & Loss</CardTitle>
                            <CardDescription>Masukkan password untuk mengakses laporan keuangan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleVerify} className="space-y-4">
                                <div>
                                    <Label htmlFor="pl-password">Password P/L</Label>
                                    <Input
                                        id="pl-password"
                                        type="password"
                                        className="mt-1"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Masukkan password"
                                        autoFocus
                                    />
                                    {verifyError && <p className="mt-1 text-sm text-red-500">{verifyError}</p>}
                                </div>
                                <Button type="submit" className="w-full" disabled={verifying || !password}>
                                    {verifying ? 'Memverifikasi...' : 'Masuk'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Profit & Loss', href: '/profit-loss' }]}>
            <div className="space-y-6 p-4">
                <h1 className="text-xl font-semibold">Laporan Profit & Loss</h1>

                {/* Date Filter */}
                <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-3">
                    <div>
                        <Label>Dari Tanggal</Label>
                        <Input type="date" className="mt-1" value={filterForm.data.start_date} onChange={(e) => filterForm.setData('start_date', e.target.value)} />
                    </div>
                    <div>
                        <Label>Sampai Tanggal</Label>
                        <Input type="date" className="mt-1" value={filterForm.data.end_date} onChange={(e) => filterForm.setData('end_date', e.target.value)} />
                    </div>
                    <Button type="submit" variant="outline">Terapkan</Button>
                </form>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">{formatRp(summary.total_income)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengeluaran</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-red-600">{formatRp(summary.total_expense)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
                            <Wallet className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <p className={`text-2xl font-bold ${summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatRp(summary.net_profit)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions Table */}
                <div>
                    <h2 className="mb-2 font-medium">Detail Pendapatan</h2>
                    <Card>
                        <CardContent className="pt-4">
                            <ServerDataTable<Transaction>
                                columns={transactionColumns}
                                apiUrl="/api/dt/profit-loss/transactions"
                                extraParams={dtExtraParams}
                                refreshKey={refreshKey}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Expenses Table */}
                <div>
                    <h2 className="mb-2 font-medium">Detail Pengeluaran</h2>
                    <Card>
                        <CardContent className="pt-4">
                            <ServerDataTable<Expense>
                                columns={expenseColumns}
                                apiUrl="/api/dt/profit-loss/expenses"
                                extraParams={dtExtraParams}
                                refreshKey={refreshKey}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <PasswordVerifyModal
                open={!!deleteItem}
                onClose={() => { setDeleteItem(null); setDeleteError(undefined); }}
                onConfirm={handleDelete}
                title="Hapus Data"
                description="Masukkan password P/L untuk menghapus data keuangan."
                loading={deleting}
                error={deleteError}
            />
        </AppLayout>
    );
}
