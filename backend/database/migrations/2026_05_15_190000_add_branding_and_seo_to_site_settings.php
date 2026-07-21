<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->string('logo_path')->nullable()->after('logo_monogram');
            $table->string('favicon_path')->nullable()->after('logo_path');
            $table->string('og_image_path')->nullable()->after('favicon_path');
            $table->string('theme_color', 16)->default('#0f1f47')->after('og_image_path');
            $table->string('meta_keywords')->nullable()->after('meta_description');
            $table->string('robots', 64)->default('index,follow')->after('meta_keywords');
            $table->string('canonical_base_url')->nullable()->after('robots');
            $table->string('google_business_url')->nullable()->after('google_review_count');
            $table->string('facebook_url')->nullable()->after('google_business_url');
            $table->string('instagram_url')->nullable()->after('facebook_url');
            $table->string('trust_line_1')->nullable()->after('footer_blurb');
            $table->string('trust_line_2')->nullable()->after('trust_line_1');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
                'logo_path',
                'favicon_path',
                'og_image_path',
                'theme_color',
                'meta_keywords',
                'robots',
                'canonical_base_url',
                'google_business_url',
                'facebook_url',
                'instagram_url',
                'trust_line_1',
                'trust_line_2',
            ]);
        });
    }
};
