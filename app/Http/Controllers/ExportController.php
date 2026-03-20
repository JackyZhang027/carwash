<?php

namespace App\Http\Controllers;

use App\Exports\ProfitLossExport;
use App\Models\Expense;
use App\Models\Setting;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\Response;

class ExportController extends Controller
{
    public function index(): \Inertia\Response
    {
        return Inertia::render('export/index');
    }

    public function export(Request $request): Response
    {
        $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'format' => ['required', 'in:pdf,xlsx'],
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        $transactions = Transaction::published()
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();

        $expenses = Expense::published()
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();

        $totalIncome = $transactions->sum('final_price');
        $totalExpense = $expenses->sum('amount');
        $netProfit = $totalIncome - $totalExpense;

        $data = compact('transactions', 'expenses', 'totalIncome', 'totalExpense', 'netProfit', 'startDate', 'endDate');
        $data['appName'] = Setting::get('app_name', 'Car Wash');

        $filename = "laporan-pl_{$startDate}_{$endDate}";

        if ($request->format === 'pdf') {
            $pdf = Pdf::loadView('exports.profit-loss', $data)->setPaper('a4', 'portrait');

            return $pdf->download("{$filename}.pdf");
        }

        return Excel::download(new ProfitLossExport($data), "{$filename}.xlsx");
    }
}
