<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Membuat akun User (Operator QC)
        User::create([
            'name' => 'Operator QC Satu',
            'email' => 'operator@eagle.com',
            'password' => Hash::make('password123'),
        ]);

        // 2. Membuat beberapa data Produk Master
        Product::create([
            'name' => 'Eagle Golf Bag X1',
            'category' => 'Tas',
            'description' => 'Tas Golf standar Nasional'
        ]);

        Product::create([
            'name' => 'Eagle Hat Pro V2',
            'category' => 'Topi',
            'description' => 'Topi Golf anti UV profesional'
        ]);
    }
}