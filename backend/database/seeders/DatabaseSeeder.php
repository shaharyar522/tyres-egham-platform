<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(BaselineDataSeeder::class);

        User::updateOrCreate([
            'email' => 'admin@eghamtyres.local',
        ], [
            'name' => 'Phase 1 Admin',
            'role' => 'admin',
            'password' => Hash::make('password'),
        ]);
    }
}
