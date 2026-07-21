<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\AppointmentAvailability;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentSlotController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $exclude = $request->string('excludeReference')->toString() ?: null;

        return response()->json(AppointmentAvailability::availability($exclude));
    }
}
