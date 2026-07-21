<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('business_name');
            $table->string('tagline')->nullable();
            $table->string('logo_monogram', 8)->default('ET');
            $table->string('phone', 32);
            $table->string('email');
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->string('town')->nullable();
            $table->string('postcode', 16);
            $table->text('footer_blurb')->nullable();
            $table->string('opening_hours_note')->nullable();
            $table->decimal('google_review_rating', 2, 1)->default(4.9);
            $table->unsignedInteger('google_review_count')->default(0);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->boolean('show_prototype_notice')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
