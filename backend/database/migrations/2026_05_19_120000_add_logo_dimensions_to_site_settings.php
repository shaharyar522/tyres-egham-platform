<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->unsignedSmallInteger('header_logo_height')->default(56)->after('logo_path');
            $table->unsignedSmallInteger('header_logo_max_width')->default(220)->after('header_logo_height');
            $table->unsignedSmallInteger('header_logo_height_mobile')->default(40)->after('header_logo_max_width');
            $table->unsignedSmallInteger('header_logo_max_width_mobile')->default(152)->after('header_logo_height_mobile');
            $table->unsignedSmallInteger('footer_logo_height')->default(52)->after('header_logo_max_width_mobile');
            $table->unsignedSmallInteger('footer_logo_max_width')->default(200)->after('footer_logo_height');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
                'header_logo_height',
                'header_logo_max_width',
                'header_logo_height_mobile',
                'header_logo_max_width_mobile',
                'footer_logo_height',
                'footer_logo_max_width',
            ]);
        });
    }
};
