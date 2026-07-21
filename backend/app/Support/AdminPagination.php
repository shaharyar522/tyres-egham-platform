<?php

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

final class AdminPagination
{
    public static function perPage(Request $request, int $default = 20): int
    {
        return min(100, max(5, (int) $request->query('perPage', $default)));
    }

    /**
     * @return array{currentPage: int, lastPage: int, perPage: int, total: int}
     */
    public static function meta(LengthAwarePaginator $paginator): array
    {
        return [
            'currentPage' => $paginator->currentPage(),
            'lastPage' => $paginator->lastPage(),
            'perPage' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }
}
