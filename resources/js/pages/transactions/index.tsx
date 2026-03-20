import { router, useForm } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Edit2, Plus, Send, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PasswordVerifyModal } from '@/components/password-verify-modal';
import { ServerDataTable } from '@/components/server-data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumericInput } from '@/components/ui/numeric-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { formatRp } from '@/lib/format';
import type { Service, Transaction, VehicleType } from '@/types';

type Props = {
    services: Service[];
    draftCount: number;
};


const vehicleLabel = (t: VehicleType) => t === 'car' ? 'Mobil' : 'Motor';

const today = new Date().toISOString().split('T')[0];

type FormData = {
    date: string;
    service_id: string;
    plate_no: string;
    vehicle_brand: string;
    adj_price: string;
    payment_method: string;
    note: string;
    publish: boolean;
};

export default function TransactionsIndex({ services, draftCount }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | undefined>();
    const [publishTarget, setPublishTarget] = useState<Transaction | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('car');
    const [refreshKey, setRefreshKey] = useState(0);

    const form = useForm<FormData>({
        date: today,
        service_id: '',
        plate_no: '',
        vehicle_brand: '',
        adj_price: '0',
        payment_method: 'cash',
        note: '',
        publish: false,
    });

    const filteredServices = services.filter((s) => s.vehicle_type === selectedVehicle);
    const selectedService = services.find((s) => String(s.id) === form.data.service_id);
    const basePrice = Number(selectedService?.price ?? 0);
    const adjPrice = parseFloat(form.data.adj_price) || 0;
    const finalPrice = basePrice + adjPrice;

    useEffect(() => {
        form.setData('service_id', '');
    }, [selectedVehicle]); // eslint-disable-line react-hooks/exhaustive-deps

    const refresh = () => setRefreshKey((k) => k + 1);

    const openAdd = () => {
        form.reset();
        form.setData('date', today);
        setEditing(null);
        setSelectedVehicle('car');
        setShowForm(true);
    };

    const openEdit = (t: Transaction) => {
        setEditing(t);
        setSelectedVehicle(t.vehicle_type);
        form.setData({
            date: t.date.split('T')[0],
            service_id: t.service_id ? String(t.service_id) : '',
            plate_no: t.plate_no ?? '',
            vehicle_brand: t.vehicle_brand ?? '',
            adj_price: String(t.adj_price),
            payment_method: t.payment_method,
            note: t.note ?? '',
            publish: false,
        });
        setShowForm(true);
    };

    const submitForm = (e: React.FormEvent, publish = false) => {
        e.preventDefault();
        if (!form.data.service_id) {
            form.setError('service_id', 'Pilih layanan terlebih dahulu.');
            return;
        }
        if (!form.data.plate_no.trim()) {
            form.setError('plate_no', 'No. polisi wajib diisi.');
            return;
        }

        if (editing) {
            form.put(`/transactions/${editing.id}`, { onSuccess: () => { setShowForm(false); refresh(); } });
        } else {
            form.transform((d) => ({ ...d, publish }));
            form.post('/transactions', {
                onSuccess: () => { setShowForm(false); refresh(); },
            });
        }
    };

    const handlePublishDraft = () => {
        if (!publishTarget) return;
        router.patch(`/transactions/${publishTarget.id}/publish`, {}, {
            onSuccess: () => { setPublishTarget(null); refresh(); },
        });
    };

    const handleDelete = (password?: string) => {
        if (!deleteTarget) return;
        const data = deleteTarget.status === 'published' ? { password } : {};
        setDeleting(true);
        setDeleteError(undefined);
        router.delete(`/transactions/${deleteTarget.id}`, {
            data,
            preserveState: true,
            onSuccess: () => { setDeleting(false); setDeleteTarget(null); refresh(); },
            onError: (errors) => {
                setDeleting(false);
                setDeleteError(errors.password ?? 'Terjadi kesalahan.');
            },
        });
    };

    const draftColumns: ColumnDef<Transaction>[] = [
        { accessorKey: 'date', header: 'Tanggal', cell: ({ getValue }) => (getValue() as string).slice(0, 10) },
        {
            accessorKey: 'service_name',
            header: 'Layanan',
            cell: ({ row }) => (
                <div>
                    <div>{row.original.service_name}</div>
                    <div className="text-xs text-muted-foreground">{vehicleLabel(row.original.vehicle_type)}</div>
                </div>
            ),
        },
        {
            accessorKey: 'plate_no',
            header: 'No. Polisi',
            cell: ({ row }) => (
                <div>
                    <div>{row.original.plate_no || '-'}</div>
                    {row.original.vehicle_brand && <div className="text-xs text-muted-foreground">{row.original.vehicle_brand}</div>}
                </div>
            ),
        },
        {
            accessorKey: 'note',
            header: 'Catatan',
            cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{(getValue() as string | null) || '-'}</span>,
        },
        {
            accessorKey: 'payment_method',
            header: 'Metode',
            cell: ({ getValue }) => <Badge variant="outline">{(getValue() as string).toUpperCase()}</Badge>,
        },
        {
            accessorKey: 'final_price',
            header: 'Total',
            cell: ({ getValue }) => <span className="font-mono">{formatRp(getValue() as number)}</span>,
        },
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

    const publishedColumns: ColumnDef<Transaction>[] = [
        { accessorKey: 'date', header: 'Tanggal', cell: ({ getValue }) => (getValue() as string).slice(0, 10) },
        {
            accessorKey: 'service_name',
            header: 'Layanan',
            cell: ({ row }) => (
                <div>
                    <div>{row.original.service_name}</div>
                    <div className="text-xs text-muted-foreground">{vehicleLabel(row.original.vehicle_type)}</div>
                </div>
            ),
        },
        {
            accessorKey: 'plate_no',
            header: 'No. Polisi',
            cell: ({ row }) => (
                <div>
                    <div>{row.original.plate_no || '-'}</div>
                    {row.original.vehicle_brand && <div className="text-xs text-muted-foreground">{row.original.vehicle_brand}</div>}
                </div>
            ),
        },
        {
            accessorKey: 'note',
            header: 'Catatan',
            cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{(getValue() as string | null) || '-'}</span>,
        },
        {
            accessorKey: 'payment_method',
            header: 'Metode',
            cell: ({ getValue }) => <Badge variant="outline">{(getValue() as string).toUpperCase()}</Badge>,
        },
        {
            accessorKey: 'final_price',
            header: 'Total',
            cell: ({ getValue }) => <span className="font-mono">{formatRp(getValue() as number)}</span>,
        },
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
        <AppLayout breadcrumbs={[{ title: 'Transaksi', href: '/transactions' }]}>
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Transaksi Kasir</h1>
                    <Button onClick={openAdd} size="sm">
                        <Plus className="mr-1 h-4 w-4" /> Transaksi Baru
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
                                <ServerDataTable<Transaction>
                                    columns={draftColumns}
                                    apiUrl="/api/dt/transactions/draft"
                                    refreshKey={refreshKey}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="published">
                        <Card>
                            <CardContent className="pt-4">
                                <ServerDataTable<Transaction>
                                    columns={publishedColumns}
                                    apiUrl="/api/dt/transactions/published"
                                    refreshKey={refreshKey}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Transaction Form Modal */}
            <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Draft' : 'Transaksi Baru'}</DialogTitle>
                        <DialogDescription className="sr-only">Form input transaksi kasir</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => submitForm(e, false)} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Tanggal</Label>
                                <Input
                                    type="date"
                                    className="mt-1"
                                    value={form.data.date}
                                    onChange={(e) => form.setData('date', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Jenis Kendaraan</Label>
                                <Select value={selectedVehicle} onValueChange={(v) => setSelectedVehicle(v as VehicleType)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="car">Mobil</SelectItem>
                                        <SelectItem value="motorcycle">Motor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Pilih Layanan</Label>
                            <Select value={form.data.service_id} onValueChange={(v) => form.setData('service_id', v)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Pilih layanan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredServices.map((s) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.name} — {formatRp(s.price)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.service_id && <p className="mt-1 text-sm text-red-500">{form.errors.service_id}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Harga (Auto)</Label>
                                <Input className="mt-1 bg-muted" readOnly value={formatRp(basePrice)} />
                            </div>
                            <div>
                                <Label>ADJ Price</Label>
                                <NumericInput
                                    className="mt-1"
                                    value={form.data.adj_price}
                                    onChange={(v) => form.setData('adj_price', v)}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="rounded-md bg-muted px-3 py-2 text-right">
                            <span className="text-sm text-muted-foreground">Harga Final: </span>
                            <span className="text-lg font-bold">{formatRp(finalPrice)}</span>
                        </div>

                        <div>
                            <Label>Metode Pembayaran</Label>
                            <div className="mt-1 flex gap-2">
                                {(['cash', 'qris'] as const).map((m) => (
                                    <Button
                                        key={m}
                                        type="button"
                                        variant={form.data.payment_method === m ? 'default' : 'outline'}
                                        className="flex-1"
                                        onClick={() => form.setData('payment_method', m)}
                                    >
                                        {m.toUpperCase()}
                                    </Button>
                                ))}
                            </div>
                            {form.errors.payment_method && <p className="mt-1 text-sm text-red-500">{form.errors.payment_method}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>No. Polisi</Label>
                                <Input
                                    className="mt-1"
                                    value={form.data.plate_no}
                                    onChange={(e) => form.setData('plate_no', e.target.value)}
                                    placeholder="B 1234 ABC"
                                />
                                {form.errors.plate_no && <p className="mt-1 text-sm text-red-500">{form.errors.plate_no}</p>}
                            </div>
                            <div>
                                <Label>Merek Kendaraan</Label>
                                <Input
                                    className="mt-1"
                                    value={form.data.vehicle_brand}
                                    onChange={(e) => form.setData('vehicle_brand', e.target.value)}
                                    placeholder="Toyota, Honda, ..."
                                />
                                {form.errors.vehicle_brand && <p className="mt-1 text-sm text-red-500">{form.errors.vehicle_brand}</p>}
                            </div>
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
                            <Button type="submit" variant="outline" disabled={form.processing}>
                                Simpan Draft
                            </Button>
                            {!editing && (
                                <Button
                                    type="button"
                                    disabled={form.processing}
                                    onClick={(e) => submitForm(e as unknown as React.FormEvent, true)}
                                >
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
                    <DialogHeader>
                        <DialogTitle>Publish Transaksi</DialogTitle>
                        <DialogDescription className="sr-only">Konfirmasi publish transaksi</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Publish transaksi <strong>{publishTarget?.service_name}</strong>?
                        Setelah dipublish, transaksi tidak dapat diedit.
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
                        <DialogHeader>
                            <DialogTitle>Hapus Draft</DialogTitle>
                            <DialogDescription className="sr-only">Konfirmasi hapus draft transaksi</DialogDescription>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">Hapus draft ini?</p>
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
                    title="Hapus Transaksi"
                    description="Transaksi yang sudah dipublish membutuhkan password untuk dihapus."
                    loading={deleting}
                    error={deleteError}
                />
            )}
        </AppLayout>
    );
}
