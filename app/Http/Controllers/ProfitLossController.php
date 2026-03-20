<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\Setting;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Yajra\DataTables\Facades\DataTables;

class ProfitLossController extends Controller
{
    public function verify(): Response
    {
        return Inertia::render('profit-loss/verify');
    }

    public function authenticate(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $plPassword = Setting::get('pl_password');

        if (! $plPassword || ! Hash::check($request->password, $plPassword)) {
            return back()->withErrors(['password' => 'Password tidak valid.']);
        }

        $request->session()->put('pl_authenticated_at', now()->timestamp);

        $intended = $request->session()->pull('pl_intended_url', route('profit-loss.index'));

        return redirect($intended);
    }

    public function checkPassword(Request $request): JsonResponse
    {
        $request->validate(['password' => ['required', 'string']]);

        $plPassword = Setting::get('pl_password');

        if (! $plPassword || ! Hash::check($request->password, $plPassword)) {
            return response()->json(['message' => 'Password tidak valid.'], 422);
        }

        return response()->json(['success' => true]);
    }

    public function index(Request $request): Response
    {
        $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $startDate = $request->get('start_date', today()->toDateString());
        $endDate = $request->get('end_date', today()->toDateString());

        $totalIncome = Transaction::published()->whereBetween('date', [$startDate, $endDate])->sum('final_price');
        $totalExpense = Expense::published()->whereBetween('date', [$startDate, $endDate])->sum('amount');

        return Inertia::render('profit-loss/index', [
            'summary' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net_profit' => $totalIncome - $totalExpense,
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function datatableTransactions(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $startDate = $request->get('start_date', today()->toDateString());
        $endDate = $request->get('end_date', today()->toDateString());

        $query = Transaction::published()
            ->whereBetween('date', [$startDate, $endDate])
            ->select(['id', 'date', 'service_name', 'vehicle_type', 'plate_no', 'payment_method', 'price', 'adj_price', 'final_price', 'note']);

        return DataTables::of($query)
            ->filterColumn('service_name', fn ($q, $k) => $q->where('service_name', 'like', "%{$k}%"))
            ->filterColumn('plate_no', fn ($q, $k) => $q->where('plate_no', 'like', "%{$k}%"))
            ->make(true);
    }

    public function datatableExpenses(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $startDate = $request->get('start_date', today()->toDateString());
        $endDate = $request->get('end_date', today()->toDateString());

        $query = Expense::published()
            ->whereBetween('date', [$startDate, $endDate])
            ->select(['id', 'date', 'type', 'amount', 'note']);

        return DataTables::of($query)
            ->filterColumn('type', fn ($q, $k) => $q->where('type', 'like', "%{$k}%"))
            ->make(true);
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget('pl_authenticated_at');

        return redirect()->route('dashboard');
    }
}
