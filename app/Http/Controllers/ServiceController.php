<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Yajra\DataTables\Facades\DataTables;

class ServiceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('services/index');
    }

    public function datatable(Request $request): JsonResponse
    {
        $showArchived = $request->boolean('show_archived');

        $query = Service::select(['id', 'vehicle_type', 'name', 'price', 'deleted_at']);

        if ($showArchived) {
            $query->onlyTrashed();
        }

        if ($request->filled('vehicle_type') && $request->vehicle_type !== 'all') {
            $query->where('vehicle_type', $request->vehicle_type);
        }

        return DataTables::of($query)
            ->filterColumn('name', fn ($q, $k) => $q->where('name', 'like', "%{$k}%"))
            ->make(true);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'vehicle_type' => ['required', 'in:car,motorcycle'],
            'name' => ['required', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
        ]);

        // Check uniqueness including soft-deleted
        $existing = Service::withTrashed()
            ->where('vehicle_type', $request->vehicle_type)
            ->where('name', $request->name)
            ->first();

        if ($existing) {
            $msg = $existing->trashed()
                ? 'Nama layanan sudah ada (diarsipkan). Pulihkan dari daftar arsip.'
                : 'Nama layanan sudah ada untuk jenis kendaraan ini.';

            return back()->withErrors(['name' => $msg]);
        }

        Service::create($request->only('vehicle_type', 'name', 'price'));

        return back()->with('success', 'Layanan berhasil ditambahkan.');
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $request->validate([
            'vehicle_type' => ['required', 'in:car,motorcycle'],
            'name' => ['required', 'string', 'max:100'],
            'price' => ['required', 'numeric', 'min:0'],
        ]);

        // Check uniqueness excluding current (including soft-deleted)
        $existing = Service::withTrashed()
            ->where('vehicle_type', $request->vehicle_type)
            ->where('name', $request->name)
            ->where('id', '!=', $service->id)
            ->first();

        if ($existing) {
            $msg = $existing->trashed()
                ? 'Nama layanan sudah ada (diarsipkan). Pulihkan dari daftar arsip.'
                : 'Nama layanan sudah ada untuk jenis kendaraan ini.';

            return back()->withErrors(['name' => $msg]);
        }

        $service->update($request->only('vehicle_type', 'name', 'price'));

        return back()->with('success', 'Layanan berhasil diperbarui.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        if ($service->isUsedInTransactions()) {
            $service->delete(); // soft delete
        } else {
            $service->forceDelete();
        }

        return back()->with('success', 'Layanan berhasil dihapus.');
    }

    public function restore(int $id): RedirectResponse
    {
        $service = Service::withTrashed()->findOrFail($id);
        $service->restore();

        return back()->with('success', 'Layanan berhasil dipulihkan.');
    }
}
