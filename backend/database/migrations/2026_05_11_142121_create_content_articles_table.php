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
        Schema::create('content_articles', function (Blueprint $table) {
            $table->id();
            $table->string('namespace')->default('content');
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('excerpt');
            $table->string('category', 64);
            $table->unsignedInteger('read_minutes')->default(3);
            $table->date('published_at')->nullable();
            $table->string('image_emoji', 16)->nullable();
            $table->longText('body')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_articles');
    }
};
