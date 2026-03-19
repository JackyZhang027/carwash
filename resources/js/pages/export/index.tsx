import { Download, FileSpreadsheet, FileText, Lock } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ExportIndex() {
    const today = new Date().toISOString().split('T')[0];

    const [verified, setVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState<string | undefined>();
    const [password, setPassword] = useState('');

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

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

    const buildUrl = (format: 'pdf' | 'xlsx') =>
        `/export/download?start_date=${startDate}&end_date=${endDate}&format=${format}`;

    if (!verified) {
        return (
            <AppLayout breadcrumbs={[{ title: 'Export Laporan', href: '/export' }]}>
                <div className="flex min-h-[60vh] items-center justify-center p-4">
                    <Card className="w-full max-w-sm">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Lock className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Export Laporan</CardTitle>
                            <CardDescription>Masukkan password untuk mengakses fitur export.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleVerify} className="space-y-4">
                                <div>
                                    <Label htmlFor="export-password">Password P/L</Label>
                                    <Input
                                        id="export-password"
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
        <AppLayout breadcrumbs={[{ title: 'Export Laporan', href: '/export' }]}>
            <div className="max-w-xl space-y-6 p-4">
                <h1 className="text-xl font-semibold">Export Laporan P/L</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Pilih Periode</CardTitle>
                        <CardDescription>Pilih rentang tanggal untuk laporan yang akan diunduh.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Dari Tanggal</Label>
                                <Input
                                    type="date"
                                    className="mt-1"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Sampai Tanggal</Label>
                                <Input
                                    type="date"
                                    className="mt-1"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <a href={buildUrl('pdf')} target="_blank" rel="noreferrer" className="flex-1">
                                <Button variant="outline" className="w-full" disabled={!startDate || !endDate}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Button>
                            </a>
                            <a href={buildUrl('xlsx')} className="flex-1">
                                <Button variant="outline" className="w-full" disabled={!startDate || !endDate}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Download XLSX
                                </Button>
                            </a>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                        <ul className="space-y-1 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Download className="h-3.5 w-3.5" />
                                Laporan mencakup semua transaksi & pengeluaran berstatus <strong>Published</strong>
                            </li>
                            <li className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5" />
                                PDF: cocok untuk arsip & cetak
                            </li>
                            <li className="flex items-center gap-2">
                                <FileSpreadsheet className="h-3.5 w-3.5" />
                                XLSX: cocok untuk analisis di spreadsheet (3 sheet: Ringkasan, Pendapatan, Pengeluaran)
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
