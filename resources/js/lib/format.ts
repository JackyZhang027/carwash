export const formatRp = (v: number): string =>
    'Rp ' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(v);
