import { useForm } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfitLossVerify() {
    const { data, setData, post, processing, errors } = useForm({ password: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profit-loss/authenticate');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Laporan Profit & Loss</CardTitle>
                    <CardDescription>Masukkan password untuk mengakses laporan keuangan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="password">Password P/L</Label>
                            <Input
                                id="password"
                                type="password"
                                className="mt-1"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan password"
                                autoFocus
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? 'Memverifikasi...' : 'Masuk'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
