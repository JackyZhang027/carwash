<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;

class ProfitLossExport implements WithMultipleSheets
{
    public function __construct(private array $data) {}

    public function sheets(): array
    {
        return [
            new ProfitLossSummarySheet($this->data),
            new ProfitLossTransactionsSheet($this->data),
            new ProfitLossExpensesSheet($this->data),
        ];
    }
}

class ProfitLossSummarySheet implements FromArray, WithColumnFormatting, WithHeadings, WithTitle
{
    public function __construct(private array $data) {}

    public function title(): string
    {
        return 'Ringkasan';
    }

    public function headings(): array
    {
        return ['Keterangan', 'Nilai (Rp)'];
    }

    public function array(): array
    {
        return [
            ['Periode', "{$this->data['startDate']} s/d {$this->data['endDate']}"],
            ['Total Pendapatan', $this->data['totalIncome']],
            ['Total Pengeluaran', $this->data['totalExpense']],
            ['Net Profit', $this->data['netProfit']],
        ];
    }

    public function columnFormats(): array
    {
        return [
            'B' => '#,##0',
        ];
    }
}

class ProfitLossTransactionsSheet implements FromArray, WithColumnFormatting, WithHeadings, WithTitle
{
    public function __construct(private array $data) {}

    public function title(): string
    {
        return 'Pendapatan';
    }

    public function headings(): array
    {
        return ['Tanggal', 'Layanan', 'Jenis Kendaraan', 'No. Polisi', 'Metode Bayar', 'Harga', 'ADJ', 'Total'];
    }

    public function array(): array
    {
        return $this->data['transactions']->map(function ($t) {
            return [
                $t->date->format('d/m/Y'),
                $t->service_name,
                $t->vehicle_type === 'car' ? 'Mobil' : 'Motor',
                $t->plate_no ?? '-',
                strtoupper($t->payment_method),
                $t->price,
                $t->adj_price,
                $t->final_price,
            ];
        })->toArray();
    }

    public function columnFormats(): array
    {
        return [
            'F' => '#,##0',
            'G' => '#,##0',
            'H' => '#,##0',
        ];
    }
}

class ProfitLossExpensesSheet implements FromArray, WithColumnFormatting, WithHeadings, WithTitle
{
    public function __construct(private array $data) {}

    public function title(): string
    {
        return 'Pengeluaran';
    }

    public function headings(): array
    {
        return ['Tanggal', 'Jenis Pengeluaran', 'Biaya (Rp)', 'Catatan'];
    }

    public function array(): array
    {
        return $this->data['expenses']->map(function ($e) {
            return [
                $e->date->format('d/m/Y'),
                $e->type,
                $e->amount,
                $e->note ?? '-',
            ];
        })->toArray();
    }

    public function columnFormats(): array
    {
        return [
            'C' => '#,##0',
        ];
    }
}
