<?php

return [
    'search_limit' => (int) env('CATALOGUE_SEARCH_LIMIT', 120),
    'browse_per_page' => (int) env('CATALOGUE_BROWSE_PER_PAGE', 48),
    'max_per_page' => (int) env('CATALOGUE_MAX_PER_PAGE', 200),
];
