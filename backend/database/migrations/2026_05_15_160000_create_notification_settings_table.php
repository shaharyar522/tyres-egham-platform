<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('appointment_reminder_enabled')->default(true);
            $table->unsignedSmallInteger('appointment_reminder_hours_before')->default(24);
            $table->boolean('payment_reminder_enabled')->default(true);
            $table->unsignedSmallInteger('payment_reminder_hours_before')->default(48);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_settings');
    }
};
