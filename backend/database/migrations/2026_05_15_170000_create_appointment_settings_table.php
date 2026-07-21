<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('capacity_per_slot')->default(2);
            $table->unsignedTinyInteger('days_ahead')->default(8);
            $table->json('closed_weekdays')->nullable();
            $table->unsignedSmallInteger('min_lead_hours')->default(2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_settings');
    }
};
