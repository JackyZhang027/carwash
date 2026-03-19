import { router, useForm, usePage } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ServerDataTable } from '@/components/server-data-table';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { formatRp } from '@/lib/format';
import type { Service } from '@/types';

const vehicleLabel = (type: string) => type === 'car' ? 'Mobil' : 'Motor';


export default function ServicesIndex() {
    const { auth } = usePage().props;
    const isAdmin = auth.roles?.includes('admin');

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Service | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
    const [vehicleFilter, setVehicleFilter] = useState('all');
    const [showArchived, setShowArchived] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const form = useForm({
        vehicle_type: 'car',
        name: '',
        price: '',
    });

    const refresh = () => setRefreshKey((k) => k + 1);

    const openAdd = () => {
        form.reset();
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (s: Service) => {
        form.setData({ vehicle_type: s.vehicle_type, name: s.name, price: String(s.price) });
        setEditing(s);
        setShowForm(true);
    };

    const submitForm = (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            form.put(`/services/${editing.id}`, { onSuccess: () => { setShowForm(false); refresh(); } });
        } else {
            form.post('/services', { onSuccess: () => { setShowForm(false); refresh(); } });
        }
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        form.delete(`/services/${deleteTarget.id}`, { onSuccess: () => { setDeleteTarget(null); refresh(); } });
    };

    const handleRestore = (s: Service) => {
        router.patch(`/services/${s.id}/restore`, {}, { onSuccess: () => refresh() });
    };

    const extraParams: Record<string, string | boolean> = {};
    if (vehicleFilter !== 'all') extraParams.vehicle_type = vehicleFilter;
    if (showArchived) extraParams.show_archived = true;

    const columns: ColumnDef<Service>[] = [
        {
            accessorKey: 'vehicle_type',
            header: 'Kendaraan',
            cell: ({ getValue }) => {
                const vt = getValue() as string;
                return <Badge variant={vt === 'car' ? 'default' : 'secondary'}>{vehicleLabel(vt)}</Badge>;
            },
        },
        { accessorKey: 'name', header: 'Nama Layanan' },
        {
            accessorKey: 'price',
            header: 'Harga',
            cell: ({ getValue }) => <span className="font-mono">{formatRp(getValue() as number)}</span>,
        },
        ...(showArchived ? [{
            id: 'archived',
            header: '',
            enableSorting: false,
            cell: () => <Badge variant="outline" className="text-xs text-muted-foreground">Diarsipkan</Badge>,
        } as ColumnDef<Service>] : []),
        ...(isAdmin ? [{
            id: 'actions',
            header: 'Aksi',
            enableSorting: false,
            cell: ({ row }: { row: { original: Service } }) => showArchived ? (
                <Button variant="ghost" size="icon" title="Pulihkan" onClick={() => handleRestore(row.original)}
                    className="text-green-600 hover:text-green-800">
                    <RotateCcw className="h-3.5 w-3.5" />
                </Button>
            ) : (
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)}>
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row.original)}
                        className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ),
        } as ColumnDef<Service>] : []),
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Pricelist', href: '/services' }]}>
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Pricelist Layanan</h1>
                    {isAdmin && !showArchived && (
                        <Button onClick={openAdd} size="sm">
                            <Plus className="mr-1 h-4 w-4" /> Tambah Layanan
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Filter:</span>
                        <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                            <SelectTrigger className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="car">Mobil</SelectItem>
                                <SelectItem value="motorcycle">Motor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <Switch
                                id="show-archived"
                                checked={showArchived}
                                onCheckedChange={(v) => { setShowArchived(v); refresh(); }}
                            />
                            <Label htmlFor="show-archived" className="text-sm cursor-pointer">Tampilkan Arsip</Label>
                        </div>
                    )}
                </div>

                <Card>
                    <CardContent className="pt-4">
                        <ServerDataTable<Service>
                            columns={columns}
                            apiUrl="/api/dt/services"
                            extraParams={extraParams}
                            refreshKey={refreshKey}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={showForm} onOpenChange={(o) => !o && setShowForm(false)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Layanan' : 'Tambah Layanan'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitForm} className="space-y-3">
                        <div>
                            <Label>Jenis Kendaraan</Label>
                            <Select value={form.data.vehicle_type} onValueChange={(v) => form.setData('vehicle_type', v)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="car">Mobil</SelectItem>
                                    <SelectItem value="motorcycle">Motor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Nama Layanan</Label>
                            <Input
                                className="mt-1"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                placeholder="Contoh: Cuci Body Standar"
                            />
                            {form.errors.name && <p className="mt-1 text-sm text-red-500">{form.errors.name}</p>}
                        </div>
                        <div>
                            <Label>Harga (Rp)</Label>
                            <Input
                                className="mt-1"
                                type="number"
                                min={0}
                                value={form.data.price}
                                onChange={(e) => form.setData('price', e.target.value)}
                                placeholder="30000"
                            />
                            {form.errors.price && <p className="mt-1 text-sm text-red-500">{form.errors.price}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Layanan</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Hapus layanan <strong>{deleteTarget?.name}</strong>? Jika sudah pernah digunakan,
                        layanan akan diarsipkan.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Hapus</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
