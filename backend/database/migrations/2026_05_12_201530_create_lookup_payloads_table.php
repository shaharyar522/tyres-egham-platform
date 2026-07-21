<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lookup_payloads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_profile_id')->nullable()->constrained()->nullOnDelete();
            $table->string('provider', 32);
            $table->string('lookup_type', 32);
            $table->string('lookup_key');
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->boolean('success')->default(false);
            $table->json('raw_request')->nullable();
            $table->json('raw_response')->nullable();
            $table->json('normalized_payload')->nullable();
            $table->string('error_code', 64)->nullable();
            $table->unsignedInteger('latency_ms')->nullable();
            $table->timestamp('fetched_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['provider', 'lookup_type', 'lookup_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lookup_payloads');
    }
};
