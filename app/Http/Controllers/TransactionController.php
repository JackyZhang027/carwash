<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Setting;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Yajra\DataTables\Facades\DataTables;

class TransactionController extends Controller
{
    public function index(): Response
    {
        $services = Service::orderBy('vehicle_type')->orderBy('name')->get(['id', 'vehicle_type', 'name', 'price']);

        return Inertia::render('transactions/index', [
            'services' => $services,
            'draftCount' => Transaction::draft()->count(),
        ]);
    }

    public function datatableDraft(): JsonResponse
    {
        $query = Transaction::draft()->select([
            'id', 'date', 'service_name', 'vehicle_type', 'vehicle_brand', 'plate_no',
            'payment_method', 'price', 'adj_price', 'final_price', 'note', 'status', 'service_id',
        ]);

        return DataTables::of($query)
            ->filterColumn('service_name', fn ($q, $k) => $q->where('service_name', 'like', "%{$k}%"))
            ->filterColumn('plate_no', fn ($q, $k) => $q->where('plate_no', 'like', "%{$k}%"))
            ->orderColumn('date', fn ($q, $dir) => $q->orderBy('date', $dir)->orderBy('created_at', $dir))
            ->make(true);
    }

    public function datatablePublished(): JsonResponse
    {
        $query = Transaction::published()->select([
            'id', 'date', 'service_name', 'vehicle_type', 'vehicle_brand', 'plate_no',
            'payment_method', 'price', 'adj_price', 'final_price', 'note', 'status', 'service_id',
        ]);

        return DataTables::of($query)
            ->filterColumn('service_name', fn ($q, $k) => $q->where('service_name', 'like', "%{$k}%"))
            ->filterColumn('plate_no', fn ($q, $k) => $q->where('plate_no', 'like', "%{$k}%"))
            ->orderColumn('date', fn ($q, $dir) => $q->orderBy('date', $dir)->orderBy('created_at', $dir))
            ->make(true);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'service_id' => ['required', 'exists:services,id'],
            'plate_no' => ['required', 'string', 'max:20'],
            'vehicle_brand' => ['nullable', 'string', 'max:50'],
            'adj_price' => ['nullable', 'numeric'],
            'payment_method' => ['required', 'in:cash,qris'],
            'note' => ['nullable', 'string'],
            'publish' => ['boolean'],
        ]);

        $service = Service::findOrFail($validated['service_id']);
        $adjPrice = $validated['adj_price'] ?? 0;
        $finalPrice = $service->price + $adjPrice;

        Transaction::create([
            'date' => $validated['date'],
            'service_id' => $service->id,
            'vehicle_type' => $service->vehicle_type,
            'vehicle_brand' => $validated['vehicle_brand'] ?? null,
            'service_name' => $service->name,
            'plate_no' => $validated['plate_no'],
            'price' => $service->price,
            'adj_price' => $adjPrice,
            'final_price' => $finalPrice,
            'payment_method' => $validated['payment_method'],
            'status' => ($validated['publish'] ?? false) ? 'published' : 'draft',
            'note' => $validated['note'] ?? null,
        ]);

        $msg = ($validated['publish'] ?? false) ? 'Transaksi berhasil dipublish.' : 'Transaksi disimpan sebagai draft.';

        return back()->with('success', $msg);
    }

    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        if ($transaction->isPublished()) {
            return back()->withErrors(['error' => 'Transaksi yang sudah dipublish tidak dapat diedit.']);
        }

        $validated = $request->validate([
            'date' => ['required', 'date'],
            'service_id' => ['required', 'exists:services,id'],
            'plate_no' => ['required', 'string', 'max:20'],
            'vehicle_brand' => ['nullable', 'string', 'max:50'],
            'adj_price' => ['nullable', 'numeric'],
            'payment_method' => ['required', 'in:cash,qris'],
            'note' => ['nullable', 'string'],
        ]);

        $service = Service::findOrFail($validated['service_id']);
        $adjPrice = $validated['adj_price'] ?? 0;

        $transaction->update([
            'date' => $validated['date'],
            'service_id' => $service->id,
            'vehicle_type' => $service->vehicle_type,
            'vehicle_brand' => $validated['vehicle_brand'] ?? null,
            'service_name' => $service->name,
            'plate_no' => $validated['plate_no'],
            'price' => $service->price,
            'adj_price' => $adjPrice,
            'final_price' => $service->price + $adjPrice,
            'payment_method' => $validated['payment_method'],
            'note' => $validated['note'] ?? null,
        ]);

        return back()->with('success', 'Draft berhasil diperbarui.');
    }

    public function publish(Transaction $transaction): RedirectResponse
    {
        if ($transaction->isPublished()) {
            return back()->withErrors(['error' => 'Transaksi sudah dipublish.']);
        }

        $transaction->update(['status' => 'published']);

        return back()->with('success', 'Transaksi berhasil dipublish.');
    }

    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        if ($transaction->isPublished()) {
            $request->validate([
                'password' => ['required', 'string'],
            ]);

            $plPassword = Setting::get('pl_password');
            if (! Hash::check($request->password, $plPassword)) {
                return back()->withErrors(['password' => 'Password tidak valid.']);
            }
        }

        $transaction->delete();

        return back()->with('success', 'Transaksi berhasil dihapus.');
    }
}
