<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'app_name' => 'Car Wash',
            'app_description' => 'Sistem Manajemen Kasir Cuci Kendaraan',
            'pl_password' => Hash::make('admin123'),
        ];

        foreach ($defaults as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
