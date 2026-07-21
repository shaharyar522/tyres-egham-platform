<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'google_review_rating' => 'float',
            'google_review_count' => 'integer',
            'show_prototype_notice' => 'boolean',
            'header_logo_height' => 'integer',
            'header_logo_max_width' => 'integer',
            'header_logo_height_mobile' => 'integer',
            'header_logo_max_width_mobile' => 'integer',
            'footer_logo_height' => 'integer',
            'footer_logo_max_width' => 'integer',
        ];
    }

    public static function current(): self
    {
        $settings = static::query()->firstOrCreate(
            ['id' => 1],
            [
                'business_name' => config('site.business_name'),
                'tagline' => config('site.tagline'),
                'logo_monogram' => config('site.logo_monogram'),
                'logo_path' => config('site.logo_path'),
                'header_logo_height' => config('site.header_logo_height'),
                'header_logo_max_width' => config('site.header_logo_max_width'),
                'header_logo_height_mobile' => config('site.header_logo_height_mobile'),
                'header_logo_max_width_mobile' => config('site.header_logo_max_width_mobile'),
                'footer_logo_height' => config('site.footer_logo_height'),
                'footer_logo_max_width' => config('site.footer_logo_max_width'),
                'phone' => config('site.phone'),
                'email' => config('site.email'),
                'address_line1' => config('site.address_line1'),
                'address_line2' => config('site.address_line2'),
                'town' => config('site.town'),
                'postcode' => config('site.postcode'),
                'footer_blurb' => config('site.footer_blurb'),
                'opening_hours_note' => config('site.opening_hours_note'),
                'google_review_rating' => config('site.google_review_rating'),
                'google_review_count' => config('site.google_review_count'),
                'meta_title' => config('site.meta_title'),
                'meta_description' => config('site.meta_description'),
                'show_prototype_notice' => config('site.show_prototype_notice'),
                'theme_color' => config('site.theme_color'),
                'meta_keywords' => config('site.meta_keywords'),
                'robots' => config('site.robots'),
                'canonical_base_url' => config('site.canonical_base_url'),
                'google_business_url' => config('site.google_business_url'),
                'facebook_url' => config('site.facebook_url'),
                'instagram_url' => config('site.instagram_url'),
                'trust_line_1' => config('site.trust_line_1'),
                'trust_line_2' => config('site.trust_line_2'),
            ],
        );

        $defaultLogo = config('site.logo_path');
        if ($defaultLogo && ! $settings->logo_path) {
            $settings->forceFill(['logo_path' => $defaultLogo])->save();
        }

        return $settings;
    }

    public function fullAddress(): string
    {
        $parts = array_filter([
            $this->address_line1,
            $this->address_line2,
            $this->town,
            $this->postcode,
        ]);

        return implode(', ', $parts);
    }

    public function phoneTel(): string
    {
        return preg_replace('/\D+/', '', $this->phone) ?? '';
    }
}
