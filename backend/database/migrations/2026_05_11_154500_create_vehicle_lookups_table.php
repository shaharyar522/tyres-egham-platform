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
        Schema::create('vehicle_lookups', function (Blueprint $table) {
            $table->id();
            $table->string('registration')->unique();
            $table->foreignId('vehicle_make_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vehicle_model_id')->nullable()->constrained()->nullOnDelete();
            $table->string('derivative')->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->string('fuel_type', 32)->nullable();
            $table->string('body_type', 32)->nullable();
            $table->unsignedSmallInteger('tyre_width');
            $table->unsignedSmallInteger('tyre_profile');
            $table->unsignedSmallInteger('tyre_rim');
            $table->unsignedSmallInteger('load_index')->nullable();
            $table->string('speed_rating', 8)->nullable();
            $table->string('tyre_category_slug', 32)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_lookups');
    }
};
