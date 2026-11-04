<?php

use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', [SitemapController::class, 'xml']);
Route::get('/robots.txt', [SitemapController::class, 'robots']);
