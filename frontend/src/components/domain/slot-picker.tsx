import { useEffect } from "react";
import { useAppointmentSlotsQuery } from "@/lib/api/queries";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";

type SlotValue = { date: string; time: string } | null;

type SlotPickerProps = {
  value: SlotValue;
  onChange: (slot: SlotValue) => void;
  excludeReference?: string;
  className?: string;
};

export function SlotPicker({ value, onChange, excludeReference, className }: SlotPickerProps) {
  const site = useSite();
  const slotsQuery = useAppointmentSlotsQuery(excludeReference);
  const days = slotsQuery.data?.days ?? [];
  const capacity = slotsQuery.data?.meta.capacityPerSlot ?? 2;

  const selectedDay = days.find((d) => d.date === value?.date);
  const times = selectedDay?.times ?? [];

  useEffect(() => {
    if (!value?.date || !value.time) return;
    const day = days.find((d) => d.date === value.date);
    const stillValid = day?.times.some((t) => t.time === value.time);
    if (!stillValid) {
      onChange(day ? { date: value.date, time: "" } : null);
    }
  }, [days, value, onChange]);

  if (slotsQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading available slots…</p>;
  }

  if (slotsQuery.isError) {
    return <p className="text-sm text-destructive">Could not load appointment times. Please refresh the page.</p>;
  }

  if (days.length === 0) {
    return (
      <p className="text-sm text-amber-800">
        No fitting slots are available in the next few days. Please call{" "}
        <a href={`tel:${site.phoneTel}`} className="font-semibold underline">
          {site.phone}
        </a>{" "}
        to arrange a time.
      </p>
    );
  }

  return (
    <div className={className}>
      <p className="mb-2 text-xs text-muted-foreground">
        Live availability — up to {capacity} bays per slot
      </p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {days.map((day) => {
          const isSelected = value?.date === day.date;
          return (
            <button
              key={day.dateIso}
              type="button"
              onClick={() => onChange({ date: day.date, time: value?.date === day.date ? value.time : "" })}
              className={cn(
                "rounded-lg border p-2 text-center text-xs transition-all",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:border-primary/40",
              )}
            >
              <span className="block font-display font-bold">{day.weekday}</span>
              <span className="block">
                {day.day} {day.month}
              </span>
            </button>
          );
        })}
      </div>

      {value?.date && times.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">
            Available times for {value.date}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
            {times.map((t) => {
              const isSelected = value.time === t.time;
              return (
                <button
                  key={t.time}
                  type="button"
                  onClick={() => onChange({ date: value.date, time: t.time })}
                  className={cn(
                    "rounded-md border px-2 py-1.5 text-sm font-semibold transition-all",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:border-primary/40",
                  )}
                >
                  {t.time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {value?.date && times.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">No times left on this day — pick another date.</p>
      )}
    </div>
  );
}

