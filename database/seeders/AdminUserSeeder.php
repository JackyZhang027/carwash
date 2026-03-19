<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@macro.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        $kasir = User::firstOrCreate(
            ['email' => 'kasir@macro.com'],
            [
                'name' => 'Kasir',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $kasir->assignRole('kasir');
    }
}
