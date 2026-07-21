<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_description');
            $table->text('long_description');
            $table->decimal('price_from', 10, 2)->nullable();
            $table->boolean('is_free')->default(false);
            $table->unsignedInteger('duration_minutes')->default(30);
            $table->string('icon_name')->nullable();
            $table->boolean('upsell_in_basket')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
