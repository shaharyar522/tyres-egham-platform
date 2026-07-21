<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class ContentArticle extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'published_at' => 'date',
        ];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->whereNotNull('published_at')
            ->whereDate('published_at', '<=', now());
    }
}
