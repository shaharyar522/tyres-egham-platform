<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 32)->unique();
            $table->string('access_token', 64)->unique();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone', 32);
            $table->string('slot_date', 32);
            $table->string('slot_time', 8);
            $table->text('notes')->nullable();
            $table->string('voucher_code', 32)->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('voucher_discount', 10, 2)->default(0);
            $table->decimal('services_total', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->json('items');
            $table->json('service_ids');
            $table->string('status', 24)->default('confirmed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
