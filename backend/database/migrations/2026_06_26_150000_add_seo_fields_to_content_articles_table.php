<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('content_articles', function (Blueprint $table) {
            $table->string('meta_title')->nullable()->after('body');
            $table->text('meta_description')->nullable()->after('meta_title');
            $table->string('meta_keywords')->nullable()->after('meta_description');
            $table->string('robots', 64)->nullable()->after('meta_keywords');
            $table->string('featured_image_path')->nullable()->after('image_emoji');
            $table->string('og_image_path')->nullable()->after('featured_image_path');
        });

        DB::table('content_articles')
            ->where('namespace', 'content')
            ->update(['namespace' => 'blog']);
    }

    public function down(): void
    {
        Schema::table('content_articles', function (Blueprint $table) {
            $table->dropColumn([
                'meta_title',
                'meta_description',
                'meta_keywords',
                'robots',
                'featured_image_path',
                'og_image_path',
            ]);
        });
    }
};
