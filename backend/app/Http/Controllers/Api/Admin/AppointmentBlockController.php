<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppointmentBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Support\AdminPagination;
use App\Support\BookingSlots;
use Illuminate\Validation\ValidationException;

class AppointmentBlockController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $paginator = AppointmentBlock::query()
            ->orderByDesc('block_date')
            ->orderBy('slot_time')
            ->paginate(AdminPagination::perPage($request));

        return response()->json([
            'blocks' => collect($paginator->items())
                ->map(fn (AppointmentBlock $block) => [
                    'id' => $block->id,
                    'blockDate' => $block->block_date->toDateString(),
                    'slotTime' => $block->slot_time === '' ? null : $block->slot_time,
                    'reason' => $block->reason,
                ])
                ->values(),
            'meta' => AdminPagination::meta($paginator),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'blockDate' => ['required', 'date'],
            'slotTime' => ['nullable', 'string', 'max:8'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $slotTime = $validated['slotTime'] ?? '';
        if ($slotTime !== '' && ! BookingSlots::isValidTime($slotTime)) {
            throw ValidationException::withMessages([
                'slotTime' => 'Invalid time. Leave blank to block the whole day.',
            ]);
        }

        $block = AppointmentBlock::create([
            'block_date' => $validated['blockDate'],
            'slot_time' => $slotTime,
            'reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'block' => [
                'id' => $block->id,
                'blockDate' => $block->block_date->toDateString(),
                'slotTime' => $block->slot_time,
                'reason' => $block->reason,
            ],
        ], 201);
    }

    public function destroy(AppointmentBlock $appointmentBlock): JsonResponse
    {
        $appointmentBlock->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
