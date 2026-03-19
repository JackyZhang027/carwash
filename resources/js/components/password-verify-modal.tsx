import { useForm } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (password: string) => void;
    title?: string;
    description?: string;
    loading?: boolean;
    error?: string;
};

export function PasswordVerifyModal({
    open,
    onClose,
    onConfirm,
    title = 'Konfirmasi Password',
    description = 'Masukkan password untuk melanjutkan.',
    loading = false,
    error,
}: Props) {
    const { data, setData, reset } = useForm({ password: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(data.password);
        reset();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="modal-password">Password P/L</Label>
                            <Input
                                id="modal-password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan password"
                                autoFocus
                                className="mt-1"
                            />
                            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading || !data.password}>
                            {loading ? 'Memverifikasi...' : 'Konfirmasi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
