<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 14px; margin-top: 20px; margin-bottom: 6px; border-bottom: 2px solid #333; padding-bottom: 4px; }
        .subtitle { color: #666; margin-bottom: 16px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .summary-card { border: 1px solid #ddd; padding: 10px 16px; border-radius: 4px; min-width: 150px; }
        .summary-card .label { font-size: 11px; color: #666; }
        .summary-card .value { font-size: 16px; font-weight: bold; }
        .positive { color: #16a34a; }
        .negative { color: #dc2626; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f3f4f6; text-align: left; padding: 6px 8px; font-size: 11px; }
        td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
        .text-right { text-align: right; }
        .footer { margin-top: 30px; font-size: 10px; color: #999; text-align: center; }
    </style>
</head>
<body>
    <h1>{{ $appName }}</h1>
    <p class="subtitle">Laporan Profit & Loss &mdash; Periode: {{ \Carbon\Carbon::parse($startDate)->format('d/m/Y') }} s/d {{ \Carbon\Carbon::parse($endDate)->format('d/m/Y') }}</p>

    <div class="summary">
        <div class="summary-card">
            <div class="label">Total Pendapatan</div>
            <div class="value positive">Rp {{ number_format($totalIncome, 0, '.', ',') }}</div>
        </div>
        <div class="summary-card">
            <div class="label">Total Pengeluaran</div>
            <div class="value negative">Rp {{ number_format($totalExpense, 0, '.', ',') }}</div>
        </div>
        <div class="summary-card">
            <div class="label">Net Profit</div>
            <div class="value {{ $netProfit >= 0 ? 'positive' : 'negative' }}">Rp {{ number_format($netProfit, 0, '.', ',') }}</div>
        </div>
    </div>

    <h2>Detail Pendapatan</h2>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Layanan</th>
                <th>Kendaraan</th>
                <th>No. Polisi</th>
                <th>Metode</th>
                <th class="text-right">Harga</th>
                <th class="text-right">ADJ</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $t)
            <tr>
                <td>{{ $t->date->format('d/m/Y') }}</td>
                <td>{{ $t->service_name }}</td>
                <td>{{ $t->vehicle_type === 'car' ? 'Mobil' : 'Motor' }}</td>
                <td>{{ $t->plate_no ?: '-' }}</td>
                <td>{{ strtoupper($t->payment_method) }}</td>
                <td class="text-right">{{ number_format($t->price, 0, '.', ',') }}</td>
                <td class="text-right">{{ number_format($t->adj_price, 0, '.', ',') }}</td>
                <td class="text-right">{{ number_format($t->final_price, 0, '.', ',') }}</td>
            </tr>
            @empty
            <tr><td colspan="8" style="text-align:center;color:#999">Tidak ada data</td></tr>
            @endforelse
            <tr>
                <td colspan="7" style="font-weight:bold;text-align:right">Total Pendapatan</td>
                <td class="text-right" style="font-weight:bold">{{ number_format($totalIncome, 0, '.', ',') }}</td>
            </tr>
        </tbody>
    </table>

    <h2>Detail Pengeluaran</h2>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Jenis Pengeluaran</th>
                <th class="text-right">Biaya</th>
                <th>Catatan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($expenses as $e)
            <tr>
                <td>{{ $e->date->format('d/m/Y') }}</td>
                <td>{{ $e->type }}</td>
                <td class="text-right">{{ number_format($e->amount, 0, '.', ',') }}</td>
                <td>{{ $e->note ?: '-' }}</td>
            </tr>
            @empty
            <tr><td colspan="4" style="text-align:center;color:#999">Tidak ada data</td></tr>
            @endforelse
            <tr>
                <td colspan="2" style="font-weight:bold;text-align:right">Total Pengeluaran</td>
                <td class="text-right" style="font-weight:bold">{{ number_format($totalExpense, 0, '.', ',') }}</td>
                <td></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">Dicetak pada {{ now()->format('d/m/Y H:i') }} &mdash; {{ $appName }}</div>
</body>
</html>
