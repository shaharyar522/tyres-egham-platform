<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Support\BookingCreator;
use App\Support\FrontendApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookingPaymentController extends Controller
{
    public function update(Request $request, string $reference): JsonResponse
    {
        $booking = Booking::query()->where('reference', $reference)->firstOrFail();

        $validated = $request->validate([
            'paymentStatus' => ['required', 'string', Rule::in(['unpaid', 'paid', 'failed', 'refunded'])],
        ]);

        $updates = ['payment_status' => $validated['paymentStatus']];

        if ($validated['paymentStatus'] === 'paid') {
            $updates['amount_paid'] = $booking->total;
            $updates['paid_at'] = now();
            if ($booking->status === 'pending_payment') {
                $updates['status'] = 'confirmed';
            }
        }

        if ($validated['paymentStatus'] === 'unpaid') {
            $updates['amount_paid'] = null;
            $updates['paid_at'] = null;
        }

        $booking->update($updates);

        return response()->json([
            'booking' => array_merge(FrontendApi::booking($booking->fresh()), [
                'manageUrl' => '/booking/manage?ref='.$booking->reference.'&token='.$booking->access_token,
            ]),
        ]);
    }
}
