import { useForm } from '@inertiajs/react';
import { Image, Lock, Settings } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type Props = {
    settings: {
        app_name: string;
        app_description: string;
    };
};

export default function AppSettingsIndex({ settings }: Props) {
    const infoForm = useForm({
        app_name: settings.app_name,
        app_description: settings.app_description,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const logoForm = useForm<{ logo: File | null }>({ logo: null });
    const faviconForm = useForm<{ favicon: File | null }>({ favicon: null });

    const submitInfo = (e: React.FormEvent) => {
        e.preventDefault();
        infoForm.put('/app-settings');
    };

    const submitPassword = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/app-settings/password', { onSuccess: () => passwordForm.reset() });
    };

    const submitLogo = (e: React.FormEvent) => {
        e.preventDefault();
        logoForm.post('/app-settings/logo');
    };

    const submitFavicon = (e: React.FormEvent) => {
        e.preventDefault();
        faviconForm.post('/app-settings/favicon');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Pengaturan Aplikasi', href: '/app-settings' }]}>
            <div className="max-w-2xl space-y-6 p-4">
                <h1 className="text-xl font-semibold">Pengaturan Aplikasi</h1>

                {/* App Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-4 w-4" /> Informasi Aplikasi
                        </CardTitle>
                        <CardDescription>Nama dan deskripsi yang tampil di UI.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitInfo} className="space-y-4">
                            <div>
                                <Label>Nama Aplikasi</Label>
                                <Input
                                    className="mt-1"
                                    value={infoForm.data.app_name}
                                    onChange={(e) => infoForm.setData('app_name', e.target.value)}
                                    placeholder="Car Wash"
                                />
                                {infoForm.errors.app_name && <p className="mt-1 text-sm text-red-500">{infoForm.errors.app_name}</p>}
                            </div>
                            <div>
                                <Label>Deskripsi</Label>
                                <Input
                                    className="mt-1"
                                    value={infoForm.data.app_description}
                                    onChange={(e) => infoForm.setData('app_description', e.target.value)}
                                    placeholder="Sistem Manajemen Kasir Cuci Kendaraan"
                                />
                            </div>
                            <Button type="submit" disabled={infoForm.processing}>
                                {infoForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Logo & Favicon */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Image className="h-4 w-4" /> Logo & Favicon
                        </CardTitle>
                        <CardDescription>Upload logo (PNG/JPG, maks 2MB) dan favicon (ICO/PNG, maks 512KB).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={submitLogo} className="flex items-end gap-3">
                            <div className="flex-1">
                                <Label>Logo</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="mt-1"
                                    onChange={(e) => logoForm.setData('logo', e.target.files?.[0] ?? null)}
                                />
                                {logoForm.errors.logo && <p className="mt-1 text-sm text-red-500">{logoForm.errors.logo}</p>}
                            </div>
                            <Button type="submit" variant="outline" disabled={!logoForm.data.logo || logoForm.processing}>
                                Upload Logo
                            </Button>
                        </form>

                        <Separator />

                        <form onSubmit={submitFavicon} className="flex items-end gap-3">
                            <div className="flex-1">
                                <Label>Favicon</Label>
                                <Input
                                    type="file"
                                    accept=".ico,.png"
                                    className="mt-1"
                                    onChange={(e) => faviconForm.setData('favicon', e.target.files?.[0] ?? null)}
                                />
                                {faviconForm.errors.favicon && <p className="mt-1 text-sm text-red-500">{faviconForm.errors.favicon}</p>}
                            </div>
                            <Button type="submit" variant="outline" disabled={!faviconForm.data.favicon || faviconForm.processing}>
                                Upload Favicon
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* P/L Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-4 w-4" /> Password Laporan P/L
                        </CardTitle>
                        <CardDescription>Password ini digunakan untuk mengakses dan menghapus data laporan keuangan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitPassword} className="space-y-4">
                            <div>
                                <Label>Password Saat Ini</Label>
                                <Input
                                    type="password"
                                    className="mt-1"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    placeholder="Password saat ini"
                                />
                                {passwordForm.errors.current_password && (
                                    <p className="mt-1 text-sm text-red-500">{passwordForm.errors.current_password}</p>
                                )}
                            </div>
                            <div>
                                <Label>Password Baru</Label>
                                <Input
                                    type="password"
                                    className="mt-1"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    placeholder="Min. 6 karakter"
                                />
                                {passwordForm.errors.password && <p className="mt-1 text-sm text-red-500">{passwordForm.errors.password}</p>}
                            </div>
                            <div>
                                <Label>Konfirmasi Password Baru</Label>
                                <Input
                                    type="password"
                                    className="mt-1"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    placeholder="Ulangi password baru"
                                />
                            </div>
                            <Button type="submit" disabled={passwordForm.processing}>
                                {passwordForm.processing ? 'Menyimpan...' : 'Ubah Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
