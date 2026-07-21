<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fitment_sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_profile_id')->constrained()->cascadeOnDelete();
            $table->string('provider', 32)->default('seeded');
            $table->string('provider_reference')->nullable();
            $table->string('fitment_type', 32)->default('oe');
            $table->string('label')->nullable();
            $table->string('tyre_category_slug', 32)->nullable();
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_staggered')->default(false);
            $table->decimal('confidence', 5, 2)->nullable();
            $table->timestamp('provider_queried_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fitment_sets');
    }
};
