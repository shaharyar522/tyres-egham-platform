<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Support\SiteAsset;
use App\Support\SiteConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class SiteSettingsController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'settings' => SiteConfig::forAdmin(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'businessName' => ['required', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:160'],
            'logoMonogram' => ['required', 'string', 'max:8'],
            'phone' => ['required', 'string', 'max:32'],
            'email' => ['required', 'email', 'max:160'],
            'addressLine1' => ['required', 'string', 'max:160'],
            'addressLine2' => ['nullable', 'string', 'max:160'],
            'town' => ['nullable', 'string', 'max:80'],
            'postcode' => ['required', 'string', 'max:16'],
            'footerBlurb' => ['nullable', 'string', 'max:500'],
            'openingHoursNote' => ['nullable', 'string', 'max:160'],
            'googleReviewRating' => ['required', 'numeric', 'min:0', 'max:5'],
            'googleReviewCount' => ['required', 'integer', 'min:0', 'max:999999'],
            'googleBusinessUrl' => ['nullable', 'url', 'max:500'],
            'facebookUrl' => ['nullable', 'url', 'max:500'],
            'instagramUrl' => ['nullable', 'url', 'max:500'],
            'tiktokUrl' => ['nullable', 'url', 'max:500'],
            'trustLine1' => ['nullable', 'string', 'max:160'],
            'trustLine2' => ['nullable', 'string', 'max:160'],
            'metaTitle' => ['nullable', 'string', 'max:160'],
            'metaDescription' => ['nullable', 'string', 'max:320'],
            'metaKeywords' => ['nullable', 'string', 'max:320'],
            'robots' => ['nullable', 'string', 'max:64'],
            'canonicalBaseUrl' => ['nullable', 'url', 'max:500'],
            'themeColor' => ['nullable', 'string', 'max:16'],
            'headerLogoHeight' => ['required', 'integer', 'min:24', 'max:160'],
            'headerLogoMaxWidth' => ['required', 'integer', 'min:80', 'max:480'],
            'headerLogoHeightMobile' => ['required', 'integer', 'min:20', 'max:120'],
            'headerLogoMaxWidthMobile' => ['required', 'integer', 'min:60', 'max:360'],
            'footerLogoHeight' => ['required', 'integer', 'min:24', 'max:160'],
            'footerLogoMaxWidth' => ['required', 'integer', 'min:80', 'max:480'],
            'showPrototypeNotice' => ['nullable'],
            'removeLogo' => ['sometimes', 'boolean'],
            'removeFavicon' => ['sometimes', 'boolean'],
            'removeOgImage' => ['sometimes', 'boolean'],
            'logo' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,svg', 'max:2048'],
            'favicon' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,ico,svg', 'max:512'],
            'ogImage' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ]);

        $settings = SiteSetting::current();

        $settings->business_name = $validated['businessName'];
        $settings->tagline = $validated['tagline'] ?: null;
        $settings->logo_monogram = strtoupper(substr($validated['logoMonogram'], 0, 8));
        $settings->phone = $validated['phone'];
        $settings->email = $validated['email'];
        $settings->address_line1 = $validated['addressLine1'];
        $settings->address_line2 = $validated['addressLine2'] ?: null;
        $settings->town = $validated['town'] ?: null;
        $settings->postcode = strtoupper($validated['postcode']);
        $settings->footer_blurb = $validated['footerBlurb'] ?: null;
        $settings->opening_hours_note = $validated['openingHoursNote'] ?: null;
        $settings->google_review_rating = round((float) $validated['googleReviewRating'], 1);
        $settings->google_review_count = (int) $validated['googleReviewCount'];
        $settings->google_business_url = $validated['googleBusinessUrl'] ?? null;
        $settings->facebook_url = $validated['facebookUrl'] ?? null;
        $settings->instagram_url = $validated['instagramUrl'] ?? null;
        $settings->tiktok_url = $validated['tiktokUrl'] ?? null;
        $settings->trust_line_1 = $validated['trustLine1'] ?? null;
        $settings->trust_line_2 = $validated['trustLine2'] ?? null;
        $settings->meta_title = $validated['metaTitle'] ?: null;
        $settings->meta_description = $validated['metaDescription'] ?: null;
        $settings->meta_keywords = $validated['metaKeywords'] ?? null;
        $settings->robots = $validated['robots'] ?? 'index,follow';
        $settings->canonical_base_url = $validated['canonicalBaseUrl'] ?? null;
        $theme = $validated['themeColor'] ?? '';
        $settings->theme_color = preg_match('/^#[0-9A-Fa-f]{6}$/', $theme) ? $theme : ($settings->theme_color ?? '#a00303');
        $settings->show_prototype_notice = $request->boolean('showPrototypeNotice');
        $settings->header_logo_height = (int) $validated['headerLogoHeight'];
        $settings->header_logo_max_width = (int) $validated['headerLogoMaxWidth'];
        $settings->header_logo_height_mobile = (int) $validated['headerLogoHeightMobile'];
        $settings->header_logo_max_width_mobile = (int) $validated['headerLogoMaxWidthMobile'];
        $settings->footer_logo_height = (int) $validated['footerLogoHeight'];
        $settings->footer_logo_max_width = (int) $validated['footerLogoMaxWidth'];

        if (! empty($validated['removeLogo'])) {
            SiteAsset::delete($settings->logo_path);
            $settings->logo_path = null;
        } elseif ($request->hasFile('logo')) {
            SiteAsset::delete($settings->logo_path);
            $settings->logo_path = SiteAsset::store($request->file('logo'), 'logo');
        }

        if (! empty($validated['removeFavicon'])) {
            SiteAsset::delete($settings->favicon_path);
            $settings->favicon_path = null;
        } elseif ($request->hasFile('favicon')) {
            SiteAsset::delete($settings->favicon_path);
            $settings->favicon_path = SiteAsset::store($request->file('favicon'), 'favicon');
        }

        if (! empty($validated['removeOgImage'])) {
            SiteAsset::delete($settings->og_image_path);
            $settings->og_image_path = null;
        } elseif ($request->hasFile('ogImage')) {
            SiteAsset::delete($settings->og_image_path);
            $settings->og_image_path = SiteAsset::store($request->file('ogImage'), 'og');
        }

        $settings->save();

        return response()->json([
            'settings' => SiteConfig::forAdmin(),
        ]);
    }
}
