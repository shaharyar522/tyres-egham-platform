<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('registration')->unique();
            $table->foreignId('vehicle_make_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vehicle_model_id')->nullable()->constrained()->nullOnDelete();
            $table->string('dvla_make_text')->nullable();
            $table->string('dvla_model_text')->nullable();
            $table->string('derivative')->nullable();
            $table->unsignedSmallInteger('year_of_manufacture')->nullable();
            $table->string('fuel_type', 32)->nullable();
            $table->string('body_type', 32)->nullable();
            $table->unsignedSmallInteger('engine_capacity')->nullable();
            $table->string('tax_status', 32)->nullable();
            $table->string('mot_status', 32)->nullable();
            $table->string('source', 32)->default('seeded');
            $table->string('source_reference')->nullable();
            $table->timestamp('last_verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_profiles');
    }
};
