import { router, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Edit2, Plus, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PasswordVerifyModal } from '@/components/password-verify-modal';
import { ServerDataTable } from '@/components/server-data-table';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRp } from '@/lib/format';
import type { Expense } from '@/types';

type Props = {
    draftCount: number;
};


const today = new Date().toISOString().split('T')[0];

export default function ExpensesIndex({ draftCount }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Expense | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | undefined>();
    const [publishTarget, setPublishTarget] = useState<Expense | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const form = useForm({
        date: today,
        type: '',
        amount: '',
        note: '',
    });

    const refresh = () => setRefreshKey((k) => k + 1);

    const openAdd = () => {
        form.reset();
        form.setData('date', today);
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (e: Expense) => {
        setEditing(e);
        form.setData({
            date: e.date.split('T')[0],
            type: e.type,
            amount: String(e.amount),
            note: e.note ?? '',
        });
        setShowForm(true);
    };

    const submitForm = (e: React.FormEvent, publish = false) => {
        e.preventDefault();
        const data = { ...form.data, publish };

        if (editing) {
            form.put(`/expenses/${editing.id}`, { onSuccess: () => { setShowForm(false); refresh(); } });
        } else {
            router.post('/expenses', data, { onSuccess: () => { setShowForm(false); refresh(); } });
        }
    };

    const handlePublishDraft = () => {
        if (!publishTarget) return;
        router.patch(`/expenses/${publishTarget.id}/publish`, {}, {
            onSuccess: () => { setPublishTarget(null); refresh(); },
        });
    };

    const handleDelete = (password?: string) => {
        if (!deleteTarget) return;
        const data = deleteTarget.status === 'published' ? { password } : {};
        setDeleting(true);
        setDeleteError(undefined);
        router.delete(`/expenses/${deleteTarget.id}`, {
            data,
            preserveState: true,
            onSuccess: () => { setDeleting(false); setDeleteTarget(null); refresh(); },
            onError: (errors) => {
                setDeleting(false);
                setDeleteError(errors.password ?? 'Terjadi kesalahan.');
            },
        });
    };

    const draftColumns: ColumnDef<Expense>[] = [
        { accessorKey: 'date', header: 'Tanggal', cell: ({ getValue }) => (getValue() as string).slice(0, 10) },
        { accessorKey: 'type', header: 'Jenis' },
        {
            accessorKey: 'amount',
            header: 'Biaya',
            cell: ({ getValue }) => <span className="font-mono">{formatRp(getValue() as number)}</span>,
        },
        { accessorKey: 'note', header: 'Catatan', cell: ({ getValue }) => (getValue() as string) || '-' },
        {
            id: 'actions',
            header: 'Aksi',
            enableSorting: false,
            cell: ({ row }) => (
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(row.original)}>
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Publish" onClick={() => setPublishTarget(row.original)}
                        className="text-green-600 hover:text-green-800">
                        <Send className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Hapus" onClick={() => setDeleteTarget(row.original)}
                        className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
        },
    ];

    const publishedColumns: ColumnDef<Expense>[] = [
        { accessorKey: 'date', header: 'Tanggal', cell: ({ getValue }) => (getValue() as string).slice(0, 10) },
        { accessorKey: 'type', header: 'Jenis' },
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
                <Button variant="ghost" size="icon" title="Hapus" onClick={() => setDeleteTarget(row.original)}
                    className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Pengeluaran', href: '/expenses' }]}>
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Pengeluaran</h1>
                    <Button onClick={openAdd} size="sm">
                        <Plus className="mr-1 h-4 w-4" /> Tambah Pengeluaran
                    </Button>
                </div>

                <Tabs defaultValue="draft">
                    <TabsList>
                        <TabsTrigger value="draft">
                            Draft
                            {draftCount > 0 && (
                                <Badge variant="destructive" className="ml-1.5 h-4 min-w-4 px-1 text-xs">
                                    {draftCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="published">Hari Ini</TabsTrigger>
                    </TabsList>

                    <TabsContent value="draft">
                        <Card>
                            <CardContent className="pt-4">
                                <ServerDataTable<Expense>
                                    columns={draftColumns}
                                    apiUrl="/api/dt/expenses/draft"
                                    refreshKey={refreshKey}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="published">
                        <Card>
                            <CardContent className="pt-4">
                                <ServerDataTable<Expense>
                                    columns={publishedColumns}
                                    apiUrl="/api/dt/expenses/published"
                                    refreshKey={refreshKey}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Form Modal */}
            <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Draft Pengeluaran' : 'Tambah Pengeluaran'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => submitForm(e, false)} className="space-y-3">
                        <div>
                            <Label>Tanggal</Label>
                            <Input type="date" className="mt-1" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} />
                        </div>
                        <div>
                            <Label>Jenis Pengeluaran</Label>
                            <Input
                                className="mt-1"
                                value={form.data.type}
                                onChange={(e) => form.setData('type', e.target.value)}
                                placeholder="Contoh: Bayar Sabun, Gaji Karyawan"
                            />
                            {form.errors.type && <p className="mt-1 text-sm text-red-500">{form.errors.type}</p>}
                        </div>
                        <div>
                            <Label>Biaya (Rp)</Label>
                            <Input
                                className="mt-1"
                                type="number"
                                min={0}
                                value={form.data.amount}
                                onChange={(e) => form.setData('amount', e.target.value)}
                                placeholder="50000"
                            />
                            {form.errors.amount && <p className="mt-1 text-sm text-red-500">{form.errors.amount}</p>}
                        </div>
                        <div>
                            <Label>Catatan (Opsional)</Label>
                            <Input
                                className="mt-1"
                                value={form.data.note}
                                onChange={(e) => form.setData('note', e.target.value)}
                                placeholder="Catatan tambahan..."
                            />
                        </div>
                        <DialogFooter className="flex-col gap-2 sm:flex-row">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
                            <Button type="submit" variant="outline" disabled={form.processing}>Simpan Draft</Button>
                            {!editing && (
                                <Button type="button" disabled={form.processing} onClick={(e) => submitForm(e as unknown as React.FormEvent, true)}>
                                    <CheckCircle className="mr-1 h-4 w-4" /> Publish
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Publish Confirm */}
            <Dialog open={!!publishTarget} onOpenChange={(o) => !o && setPublishTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader><DialogTitle>Publish Pengeluaran</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Publish <strong>{publishTarget?.type}</strong>? Setelah dipublish tidak dapat diedit.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPublishTarget(null)}>Batal</Button>
                        <Button onClick={handlePublishDraft}>Publish</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete */}
            {deleteTarget?.status === 'draft' ? (
                <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader><DialogTitle>Hapus Draft</DialogTitle></DialogHeader>
                        <p className="text-sm text-muted-foreground">Hapus draft pengeluaran ini?</p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
                            <Button variant="destructive" onClick={() => handleDelete()}>Hapus</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : (
                <PasswordVerifyModal
                    open={!!deleteTarget && deleteTarget.status === 'published'}
                    onClose={() => { setDeleteTarget(null); setDeleteError(undefined); }}
                    onConfirm={(pwd) => handleDelete(pwd)}
                    title="Hapus Pengeluaran"
                    description="Pengeluaran yang sudah dipublish membutuhkan password untuk dihapus."
                    loading={deleting}
                    error={deleteError}
                />
            )}
        </AppLayout>
    );
}
