import { useForm, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Auth } from '@/types';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: string | null;
    created_at: string;
};

type Props = {
    users: UserRow[];
};

export default function UsersIndex({ users }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'kasir',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/users', {
            onSuccess: () => {
                form.reset();
                setShowForm(false);
            },
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        form.delete(`/users/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Pengguna', href: '/users' }]}>
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Pengguna</h1>
                    <Button size="sm" onClick={() => setShowForm(true)}>
                        <Plus className="mr-1 h-4 w-4" /> Tambah Pengguna
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                    <TableHead className="w-12" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                            Belum ada pengguna.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                {user.role === 'admin' ? 'Admin' : 'Kasir'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.created_at}</TableCell>
                                        <TableCell>
                                            {user.id !== auth.user.id && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => setDeleteTarget(user)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Add User Modal */}
            <Dialog open={showForm} onOpenChange={(o) => { if (!o) { setShowForm(false); form.reset(); } }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Tambah Pengguna</DialogTitle>
                        <DialogDescription className="sr-only">Form tambah pengguna baru</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Nama</Label>
                                <Input
                                    className="mt-1"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Nama lengkap"
                                />
                                {form.errors.name && <p className="mt-1 text-sm text-red-500">{form.errors.name}</p>}
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    className="mt-1"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                />
                                {form.errors.email && <p className="mt-1 text-sm text-red-500">{form.errors.email}</p>}
                            </div>
                            <div>
                                <Label>Password</Label>
                                <Input
                                    type="password"
                                    className="mt-1"
                                    value={form.data.password}
                                    onChange={(e) => form.setData('password', e.target.value)}
                                    placeholder="Min. 6 karakter"
                                />
                                {form.errors.password && <p className="mt-1 text-sm text-red-500">{form.errors.password}</p>}
                            </div>
                            <div>
                                <Label>Konfirmasi Password</Label>
                                <Input
                                    type="password"
                                    className="mt-1"
                                    value={form.data.password_confirmation}
                                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                                    placeholder="Ulangi password"
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Select value={form.data.role} onValueChange={(v) => form.setData('role', v)}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kasir">Kasir</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            {form.errors.role && <p className="mt-1 text-sm text-red-500">{form.errors.role}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setShowForm(false); form.reset(); }}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Modal */}
            <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Hapus Pengguna</DialogTitle>
                        <DialogDescription className="sr-only">Konfirmasi hapus pengguna</DialogDescription>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Hapus pengguna <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={form.processing}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
