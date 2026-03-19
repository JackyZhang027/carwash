<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AppSettingsController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('app-settings/index', [
            'settings' => [
                'app_name' => Setting::get('app_name', 'Car Wash'),
                'app_description' => Setting::get('app_description', ''),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'app_name' => ['required', 'string', 'max:100'],
            'app_description' => ['nullable', 'string', 'max:255'],
        ]);

        Setting::set('app_name', $request->app_name);
        Setting::set('app_description', $request->app_description ?? '');

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $current = Setting::get('pl_password');
        if (! $current || ! Hash::check($request->current_password, $current)) {
            return back()->withErrors(['current_password' => 'Password saat ini tidak valid.']);
        }

        Setting::set('pl_password', Hash::make($request->password));

        return back()->with('success', 'Password P/L berhasil diperbarui.');
    }

    public function updateLogo(Request $request): RedirectResponse
    {
        $request->validate([
            'logo' => ['required', 'image', 'max:2048'],
        ]);

        // Store via Spatie Media Library on a dedicated model or use simple storage
        $path = $request->file('logo')->store('logos', 'public');
        Setting::set('app_logo', $path);

        return back()->with('success', 'Logo berhasil diperbarui.');
    }

    public function updateFavicon(Request $request): RedirectResponse
    {
        $request->validate([
            'favicon' => ['required', 'file', 'mimes:ico,png', 'max:512'],
        ]);

        $path = $request->file('favicon')->store('favicons', 'public');
        Setting::set('app_favicon', $path);

        return back()->with('success', 'Favicon berhasil diperbarui.');
    }
}
