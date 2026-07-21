<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fitment_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fitment_set_id')->constrained()->cascadeOnDelete();
            $table->string('position', 16)->default('all_round');
            $table->unsignedSmallInteger('width');
            $table->unsignedSmallInteger('profile');
            $table->unsignedSmallInteger('rim');
            $table->unsignedSmallInteger('load_index')->nullable();
            $table->string('speed_rating', 8)->nullable();
            $table->string('tyre_category_slug', 32)->nullable();
            $table->boolean('is_extra_load')->default(false);
            $table->boolean('is_run_flat')->default(false);
            $table->boolean('is_winter')->default(false);
            $table->boolean('is_all_season')->default(false);
            $table->boolean('is_ev_rated')->default(false);
            $table->boolean('is_van')->default(false);
            $table->boolean('is_4x4')->default(false);
            $table->string('oe_marking', 16)->nullable();
            $table->unsignedTinyInteger('recommended_quantity')->default(2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fitment_positions');
    }
};
