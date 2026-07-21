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
        Schema::create('tyre_skus', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('slug')->unique();
            $table->foreignId('brand_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tyre_category_id')->constrained()->cascadeOnDelete();
            $table->string('model_name');
            $table->unsignedSmallInteger('width');
            $table->unsignedSmallInteger('profile');
            $table->unsignedSmallInteger('rim');
            $table->unsignedSmallInteger('load_index');
            $table->string('speed_rating', 8);
            $table->boolean('is_extra_load')->default(false);
            $table->boolean('is_run_flat')->default(false);
            $table->boolean('is_winter')->default(false);
            $table->boolean('is_all_season')->default(false);
            $table->boolean('is_ev_rated')->default(false);
            $table->boolean('is_van')->default(false);
            $table->boolean('is_4x4')->default(false);
            $table->boolean('is_available_within_24h')->default(false);
            $table->string('manufacturer_sku');
            $table->string('ean')->nullable();
            $table->json('eu_label');
            $table->json('oe_approvals')->nullable();
            $table->string('video_url')->nullable();
            $table->decimal('price_per_tyre', 10, 2);
            $table->json('quantity_tiers');
            $table->decimal('star_rating', 3, 1)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->unsignedInteger('stock')->default(0);
            $table->json('badges')->nullable();
            $table->boolean('has_active_offer')->default(false);
            $table->string('voucher_code')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tyre_skus');
    }
};
