<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Yajra\DataTables\Facades\DataTables;

class ExpenseController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('expenses/index', [
            'draftCount' => Expense::draft()->count(),
        ]);
    }

    public function datatableDraft(): JsonResponse
    {
        $query = Expense::draft()->select(['id', 'date', 'type', 'amount', 'note', 'status']);

        return DataTables::of($query)
            ->filterColumn('type', fn ($q, $k) => $q->where('type', 'like', "%{$k}%"))
            ->orderColumn('date', fn ($q, $dir) => $q->orderBy('date', $dir)->orderBy('created_at', $dir))
            ->make(true);
    }

    public function datatablePublished(): JsonResponse
    {
        $query = Expense::published()->select(['id', 'date', 'type', 'amount', 'note', 'status']);

        return DataTables::of($query)
            ->filterColumn('type', fn ($q, $k) => $q->where('type', 'like', "%{$k}%"))
            ->orderColumn('date', fn ($q, $dir) => $q->orderBy('date', $dir)->orderBy('created_at', $dir))
            ->make(true);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'type' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string'],
            'publish' => ['boolean'],
        ]);

        Expense::create([
            'date' => $validated['date'],
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'note' => $validated['note'] ?? null,
            'status' => ($validated['publish'] ?? false) ? 'published' : 'draft',
        ]);

        $msg = ($validated['publish'] ?? false) ? 'Pengeluaran berhasil dipublish.' : 'Pengeluaran disimpan sebagai draft.';

        return back()->with('success', $msg);
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        if ($expense->isPublished()) {
            return back()->withErrors(['error' => 'Pengeluaran yang sudah dipublish tidak dapat diedit.']);
        }

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'type' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string'],
        ]);

        $expense->update($validated);

        return back()->with('success', 'Draft pengeluaran berhasil diperbarui.');
    }

    public function publish(Expense $expense): RedirectResponse
    {
        if ($expense->isPublished()) {
            return back()->withErrors(['error' => 'Pengeluaran sudah dipublish.']);
        }

        $expense->update(['status' => 'published']);

        return back()->with('success', 'Pengeluaran berhasil dipublish.');
    }

    public function destroy(Request $request, Expense $expense): RedirectResponse
    {
        if ($expense->isPublished()) {
            $request->validate([
                'password' => ['required', 'string'],
            ]);

            $plPassword = \App\Models\Setting::get('pl_password');
            if (! Hash::check($request->password, $plPassword)) {
                return back()->withErrors(['password' => 'Password tidak valid.']);
            }
        }

        $expense->delete();

        return back()->with('success', 'Pengeluaran berhasil dihapus.');
    }
}
