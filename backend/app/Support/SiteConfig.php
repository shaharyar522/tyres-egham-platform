<?php

namespace App\Support;

use App\Models\SiteSetting;

class SiteConfig
{
    public static function settings(): SiteSetting
    {
        return SiteSetting::current();
    }

    /**
     * @return array<string, mixed>
     */
    private static function baseFields(SiteSetting $s): array
    {
        return [
            'businessName' => $s->business_name,
            'tagline' => $s->tagline ?? '',
            'logoMonogram' => $s->logo_monogram,
            'logoUrl' => SiteAsset::url($s->logo_path),
            'headerLogoHeight' => (int) ($s->header_logo_height ?? 56),
            'headerLogoMaxWidth' => (int) ($s->header_logo_max_width ?? 220),
            'headerLogoHeightMobile' => (int) ($s->header_logo_height_mobile ?? 40),
            'headerLogoMaxWidthMobile' => (int) ($s->header_logo_max_width_mobile ?? 152),
            'footerLogoHeight' => (int) ($s->footer_logo_height ?? 52),
            'footerLogoMaxWidth' => (int) ($s->footer_logo_max_width ?? 200),
            'faviconUrl' => SiteAsset::url($s->favicon_path),
            'ogImageUrl' => SiteAsset::url($s->og_image_path),
            'themeColor' => ($s->theme_color && preg_match('/^#[0-9A-Fa-f]{6}$/', $s->theme_color)) ? $s->theme_color : '#a00303',
            'phone' => $s->phone,
            'phoneTel' => $s->phoneTel(),
            'email' => $s->email,
            'addressLine1' => $s->address_line1,
            'addressLine2' => $s->address_line2 ?? '',
            'town' => $s->town ?? '',
            'postcode' => $s->postcode,
            'fullAddress' => $s->fullAddress(),
            'footerBlurb' => $s->footer_blurb ?? '',
            'openingHoursNote' => $s->opening_hours_note ?? '',
            'googleReviewRating' => (float) $s->google_review_rating,
            'googleReviewCount' => (int) $s->google_review_count,
            'googleBusinessUrl' => $s->google_business_url ?? '',
            'facebookUrl' => $s->facebook_url ?? '',
            'instagramUrl' => $s->instagram_url ?? '',
            'tiktokUrl' => $s->tiktok_url ?? '',
            'trustLine1' => $s->trust_line_1 ?? '',
            'trustLine2' => $s->trust_line_2 ?? '',
            'metaTitle' => $s->meta_title ?? '',
            'metaDescription' => $s->meta_description ?? '',
            'metaKeywords' => $s->meta_keywords ?? '',
            'robots' => $s->robots ?? 'index,follow',
            'canonicalBaseUrl' => $s->canonical_base_url ?? '',
            'showPrototypeNotice' => (bool) $s->show_prototype_notice,
            'headCode' => $s->head_code ?? '',
            'bodyCode' => $s->body_code ?? '',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function forAdmin(): array
    {
        return self::baseFields(self::settings());
    }

    /**
     * @return array<string, mixed>
     */
    public static function forBootstrap(): array
    {
        $s = self::settings();

        return array_merge([
            'name' => config('app.name'),
            'apiBaseUrl' => config('app.url'),
            'frontendUrl' => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5175')),
        ], self::baseFields($s));
    }

    /**
     * @return array{name: string, address: string, postcode: string, phone: string, phoneTel: string, email: string}
     */
    public static function workshop(): array
    {
        $s = self::settings();

        return [
            'name' => $s->business_name,
            'address' => trim($s->address_line1.', '.($s->address_line2 ?: $s->town)),
            'postcode' => $s->postcode,
            'phone' => $s->phone,
            'phoneTel' => $s->phoneTel(),
            'email' => $s->email,
        ];
    }
}
