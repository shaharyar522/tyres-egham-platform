<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tyre_pattern_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained()->cascadeOnDelete();
            $table->string('pattern_key')->unique()->comment('Stable key, e.g. /tyre/details/continental/allseasoncontact');
            $table->string('model_name');
            $table->decimal('price_from_gbp', 10, 2);
            $table->decimal('rating_out_of_5', 2, 1)->nullable();
            $table->string('detail_url');
            $table->string('brand_list_url')->nullable();
            $table->char('source_row_checksum', 32)->nullable();
            $table->char('source_file_checksum', 32)->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tyre_pattern_listings');
    }
};
