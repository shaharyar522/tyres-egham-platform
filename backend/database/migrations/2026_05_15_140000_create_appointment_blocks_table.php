<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointment_blocks', function (Blueprint $table) {
            $table->id();
            $table->date('block_date');
            $table->string('slot_time', 8)->default('');
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->unique(['block_date', 'slot_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_blocks');
    }
};
