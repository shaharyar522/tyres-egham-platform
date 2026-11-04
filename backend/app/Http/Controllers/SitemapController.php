<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Brand;
use App\Models\ContentArticle;
use App\Models\Service;
use App\Models\TyreCategory;
use App\Models\TyreSku;
use App\Support\SiteConfig;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class SitemapController extends Controller
{
    public function xml(): Response
    {
        $base = $this->siteBaseUrl();
        $urls = [];

        foreach ($this->staticPaths() as $path => $meta) {
            $urls[] = [
                'loc' => $this->absoluteUrl($base, $path),
                'changefreq' => $meta['changefreq'],
                'priority' => $meta['priority'],
                'lastmod' => $meta['lastmod'] ?? null,
            ];
        }

        foreach (TyreCategory::query()->orderBy('id')->get(['slug', 'updated_at']) as $category) {
            $urls[] = [
                'loc' => $this->absoluteUrl($base, '/tyresearch/results?TyreCategory='.rawurlencode((string) $category->slug)),
                'changefreq' => 'weekly',
                'priority' => '0.8',
                'lastmod' => $this->formatDate($category->updated_at),
            ];
        }

        foreach (Brand::query()->orderBy('id')->get(['id', 'slug', 'updated_at']) as $brand) {
            $urls[] = [
                'loc' => $this->absoluteUrl($base, '/tyre/brand/'.$brand->id.'/'.$brand->slug.'-tyres'),
                'changefreq' => 'weekly',
                'priority' => '0.8',
                'lastmod' => $this->formatDate($brand->updated_at),
            ];
        }

        foreach (Service::query()->orderBy('id')->get(['id', 'slug', 'updated_at']) as $service) {
            $urls[] = [
                'loc' => $this->absoluteUrl($base, '/services/details/'.$service->id.'/'.$service->slug),
                'changefreq' => 'monthly',
                'priority' => '0.7',
                'lastmod' => $this->formatDate($service->updated_at),
            ];
        }

        foreach (Area::query()->orderBy('id')->get(['slug', 'updated_at']) as $area) {
            $urls[] = [
                'loc' => $this->absoluteUrl($base, '/areas-served/'.$area->slug),
                'changefreq' => 'monthly',
                'priority' => '0.6',
                'lastmod' => $this->formatDate($area->updated_at),
            ];
        }

        foreach (
            ContentArticle::query()
                ->where('namespace', 'blog')
                ->published()
                ->orderBy('id')
                ->get(['slug', 'published_at', 'updated_at']) as $article
        ) {
            $urls[] = [
                'loc' => $this->absoluteUrl($base, '/blog/'.$article->slug),
                'changefreq' => 'monthly',
                'priority' => '0.6',
                'lastmod' => $this->formatDate($article->updated_at ?? $article->published_at),
            ];
        }

        foreach (
            ContentArticle::query()
                ->where('namespace', 'page')
                ->orderBy('id')
                ->get(['slug', 'updated_at']) as $page
        ) {
            $urls[] = [
                'loc' => $this->absoluteUrl($base, '/'.$page->slug),
                'changefreq' => 'yearly',
                'priority' => '0.4',
                'lastmod' => $this->formatDate($page->updated_at),
            ];
        }

        foreach (
            TyreSku::query()
                ->visible()
                ->orderBy('id')
                ->get(['id', 'slug', 'updated_at']) as $sku
        ) {
            $urls[] = [
                'loc' => $this->absoluteUrl($base, '/tyresearch/details/'.$sku->id.'/'.$sku->slug),
                'changefreq' => 'weekly',
                'priority' => '0.7',
                'lastmod' => $this->formatDate($sku->updated_at),
            ];
        }

        $xml = $this->renderUrlset($urls);

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    public function robots(): Response
    {
        $base = $this->siteBaseUrl();
        $sitemap = $this->absoluteUrl($base, '/sitemap.xml');

        $body = implode("\n", [
            '# The Tyres Egham — https://thetyresegham.co.uk',
            'User-agent: *',
            'Allow: /',
            '',
            '# Private / transactional areas',
            'Disallow: /admin',
            'Disallow: /admin/',
            'Disallow: /basket',
            'Disallow: /basket/',
            'Disallow: /booking/',
            'Disallow: /api/',
            '',
            '# Prefer the XML sitemap for discovery',
            'Sitemap: '.$sitemap,
            '',
        ]);

        return response($body, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }

    /**
     * @return array<string, array{changefreq: string, priority: string, lastmod?: string|null}>
     */
    private function staticPaths(): array
    {
        return [
            '/' => ['changefreq' => 'daily', 'priority' => '1.0'],
            '/about' => ['changefreq' => 'monthly', 'priority' => '0.7'],
            '/contact-us' => ['changefreq' => 'monthly', 'priority' => '0.7'],
            '/brands' => ['changefreq' => 'weekly', 'priority' => '0.8'],
            '/makes' => ['changefreq' => 'weekly', 'priority' => '0.6'],
            '/tyres' => ['changefreq' => 'daily', 'priority' => '0.8'],
            '/services' => ['changefreq' => 'weekly', 'priority' => '0.8'],
            '/offers' => ['changefreq' => 'weekly', 'priority' => '0.7'],
            '/blog' => ['changefreq' => 'weekly', 'priority' => '0.7'],
            '/reviews' => ['changefreq' => 'weekly', 'priority' => '0.6'],
            '/areas-served' => ['changefreq' => 'monthly', 'priority' => '0.6'],
            '/faq/booking-faq' => ['changefreq' => 'monthly', 'priority' => '0.5'],
            '/sitemap' => ['changefreq' => 'monthly', 'priority' => '0.3'],
        ];
    }

    private function siteBaseUrl(): string
    {
        $settings = SiteConfig::settings();
        $candidate = $settings->canonical_base_url
            ?: config('app.frontend_url')
            ?: config('app.url')
            ?: '';

        return rtrim((string) $candidate, '/');
    }

    private function absoluteUrl(string $base, string $path): string
    {
        if ($path === '/' || $path === '') {
            return $base.'/';
        }

        return $base.(str_starts_with($path, '/') ? $path : '/'.$path);
    }

    private function formatDate(mixed $value): ?string
    {
        if (! $value) {
            return null;
        }

        try {
            return Carbon::parse($value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @param  list<array{loc: string, changefreq: string, priority: string, lastmod: ?string}>  $urls
     */
    private function renderUrlset(array $urls): string
    {
        $lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ];

        foreach ($urls as $url) {
            $lines[] = '  <url>';
            $lines[] = '    <loc>'.htmlspecialchars($url['loc'], ENT_XML1 | ENT_COMPAT, 'UTF-8').'</loc>';
            if (! empty($url['lastmod'])) {
                $lines[] = '    <lastmod>'.$url['lastmod'].'</lastmod>';
            }
            $lines[] = '    <changefreq>'.$url['changefreq'].'</changefreq>';
            $lines[] = '    <priority>'.$url['priority'].'</priority>';
            $lines[] = '  </url>';
        }

        $lines[] = '</urlset>';

        return implode("\n", $lines)."\n";
    }
}
