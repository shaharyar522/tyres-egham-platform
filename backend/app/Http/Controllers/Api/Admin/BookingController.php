<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\BookingCancelledMail;
use App\Mail\BookingConfirmationMail;
use App\Models\Booking;
use App\Models\Service;
use App\Models\TyreSku;
use App\Support\AdminPagination;
use App\Support\BookingCreator;
use App\Support\FrontendApi;
use App\Support\OutboundMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $paginator = Booking::query()
            ->orderByDesc('created_at')
            ->paginate(AdminPagination::perPage($request));

        return response()->json([
            'bookings' => collect($paginator->items())
                ->map(fn (Booking $booking) => $this->toAdminArray($booking))
                ->values(),
            'meta' => AdminPagination::meta($paginator),
        ]);
    }

    public function show(string $reference): JsonResponse
    {
        $booking = Booking::query()->where('reference', $reference)->firstOrFail();

        return response()->json([
            'booking' => $this->toAdminArray($booking, true),
        ]);
    }

    public function update(Request $request, string $reference): JsonResponse
    {
        $booking = Booking::query()->where('reference', $reference)->firstOrFail();

        $validated = $request->validate([
            'status' => ['sometimes', 'string', Rule::in(['confirmed', 'cancelled', 'pending_payment'])],
            'paymentStatus' => ['sometimes', 'string', Rule::in(['unpaid', 'pending', 'paid', 'failed', 'refunded'])],
            'notes' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $updates = [];

        if (array_key_exists('status', $validated)) {
            $updates['status'] = $validated['status'];
        }
        if (array_key_exists('notes', $validated)) {
            $updates['notes'] = $validated['notes'];
        }
        if (array_key_exists('paymentStatus', $validated)) {
            $updates['payment_status'] = $validated['paymentStatus'];
            if ($validated['paymentStatus'] === 'paid') {
                $updates['amount_paid'] = $booking->total;
                $updates['paid_at'] = now();
                if ($booking->status === 'pending_payment') {
                    $updates['status'] = 'confirmed';
                }
            } elseif ($validated['paymentStatus'] === 'unpaid') {
                $updates['amount_paid'] = null;
                $updates['paid_at'] = null;
            }
        }

        if ($updates !== []) {
            $booking->update($updates);
        }

        return response()->json([
            'booking' => $this->toAdminArray($booking->fresh(), true),
            'message' => 'Booking updated.',
        ]);
    }

    public function cancel(string $reference): JsonResponse
    {
        $booking = Booking::query()->where('reference', $reference)->firstOrFail();

        if ($booking->status === 'cancelled') {
            return response()->json([
                'booking' => $this->toAdminArray($booking, true),
                'message' => 'Booking is already cancelled.',
            ]);
        }

        $booking->update(['status' => 'cancelled']);

        $emailSent = OutboundMail::send(
            new BookingCancelledMail($booking->fresh()),
            $booking->customer_email,
            'booking-cancel-admin',
        );

        return response()->json([
            'booking' => $this->toAdminArray($booking->fresh(), true),
            'message' => 'Booking cancelled.',
            'emailSent' => $emailSent,
        ]);
    }

    public function resendConfirmation(string $reference): JsonResponse
    {
        $booking = Booking::query()->where('reference', $reference)->firstOrFail();

        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Cannot send confirmation for a cancelled booking.'], 422);
        }

        $emailSent = BookingCreator::sendConfirmation($booking);

        return response()->json([
            'message' => $emailSent ? 'Confirmation email sent.' : 'Email could not be sent (check mail settings).',
            'emailSent' => $emailSent,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function toAdminArray(Booking $booking, bool $detailed = false): array
    {
        $payload = array_merge(FrontendApi::booking($booking), [
            'manageUrl' => '/booking/manage?ref='.$booking->reference.'&token='.$booking->access_token,
            'appointmentReminderSentAt' => optional($booking->appointment_reminder_sent_at)->toIso8601String(),
            'paymentReminderSentAt' => optional($booking->payment_reminder_sent_at)->toIso8601String(),
        ]);

        if (! $detailed) {
            return $payload;
        }

        $skuIds = collect($booking->items ?? [])->pluck('skuId')->filter()->unique()->values();
        $skus = TyreSku::query()->with('brand')->whereIn('id', $skuIds)->get()->keyBy('id');

        $payload['lineItems'] = collect($booking->items ?? [])->map(function (array $item) use ($skus) {
            $sku = $skus->get($item['skuId'] ?? 0);
            $snapshot = $item['snapshot'] ?? [];
            $qty = (int) ($item['qty'] ?? 1);
            $unit = (float) ($snapshot['pricePerTyre'] ?? 0);

            return [
                'skuId' => $item['skuId'] ?? null,
                'qty' => $qty,
                'label' => $sku
                    ? trim(($sku->brand?->name ?? '').' '.$sku->model_name)
                    : 'Tyre #'.($item['skuId'] ?? '?'),
                'size' => $sku ? "{$sku->width}/{$sku->profile}R{$sku->rim}" : null,
                'unitPrice' => $unit,
                'lineTotal' => round($unit * $qty, 2),
            ];
        })->values()->all();

        $serviceIds = $booking->service_ids ?? [];
        $payload['services'] = $serviceIds === []
            ? []
            : Service::query()->whereIn('id', $serviceIds)->get()->map(fn (Service $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'priceFrom' => $s->is_free ? 'free' : (float) $s->price_from,
            ])->values()->all();

        return $payload;
    }
}
