<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServicesSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['vehicle_type' => 'car', 'name' => 'Cuci Body Standar', 'price' => 30000],
            ['vehicle_type' => 'car', 'name' => 'Cuci Body + Kolong', 'price' => 45000],
            ['vehicle_type' => 'car', 'name' => 'Cuci Body + Interior', 'price' => 60000],
            ['vehicle_type' => 'car', 'name' => 'Full Detailing', 'price' => 150000],
            ['vehicle_type' => 'motorcycle', 'name' => 'Cuci Standar', 'price' => 15000],
            ['vehicle_type' => 'motorcycle', 'name' => 'Cuci + Semir Ban', 'price' => 20000],
            ['vehicle_type' => 'motorcycle', 'name' => 'Cuci Lengkap', 'price' => 25000],
        ];

        foreach ($services as $service) {
            Service::firstOrCreate(
                ['vehicle_type' => $service['vehicle_type'], 'name' => $service['name']],
                ['price' => $service['price']]
            );
        }
    }
}
