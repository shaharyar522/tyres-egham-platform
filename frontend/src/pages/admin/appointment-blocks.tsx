import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPagination } from "@/components/admin/admin-pagination";
import {
  useAdminAppointmentBlocksQuery,
  useAdminAppointmentSettingsQuery,
  useAdminCreateAppointmentBlockMutation,
  useAdminDeleteAppointmentBlockMutation,
  useAdminSaveAppointmentSettingsMutation,
} from "@/lib/admin/queries";
import { Checkbox } from "@/components/ui/checkbox";
import { SLOT_TIMES } from "@/lib/booking-slots";
import { ApiError } from "@/lib/api/client";
import {
  AdminCardListSkeleton,
  AdminInlineFieldsSkeleton,
} from "@/components/admin/admin-skeletons";
import { useAdminListPage } from "@/lib/admin/pagination";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

const WEEKDAYS: { value: number; label: string }[] = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export default function AdminAppointmentBlocksPage() {
  const { page, setPage } = useAdminListPage();
  const blocksQuery = useAdminAppointmentBlocksQuery({ page });
  const settingsQuery = useAdminAppointmentSettingsQuery();
  const saveSettingsMutation = useAdminSaveAppointmentSettingsMutation();
  const createMutation = useAdminCreateAppointmentBlockMutation();
  const deleteMutation = useAdminDeleteAppointmentBlockMutation();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [blockDate, setBlockDate] = useState("");
  const [slotTime, setSlotTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [capacityPerSlot, setCapacityPerSlot] = useState(2);
  const [daysAhead, setDaysAhead] = useState(8);
  const [minLeadHours, setMinLeadHours] = useState(2);
  const [closedWeekdays, setClosedWeekdays] = useState<number[]>([0]);

  useEffect(() => {
    const s = settingsQuery.data?.settings;
    if (!s) return;
    setCapacityPerSlot(s.capacityPerSlot);
    setDaysAhead(s.daysAhead);
    setMinLeadHours(s.minLeadHours);
    setClosedWeekdays(s.closedWeekdays);
  }, [settingsQuery.data?.settings]);

  const blocks = blocksQuery.data?.blocks ?? [];
  const blocksMeta = blocksQuery.data?.meta;
  const slotTimes = settingsQuery.data?.settings?.slotTimes ?? SLOT_TIMES;

  const toggleWeekday = (day: number, checked: boolean) => {
    setClosedWeekdays((prev) =>
      checked ? [...prev, day].sort((a, b) => a - b) : prev.filter((d) => d !== day),
    );
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsMessage(null);
    try {
      await saveSettingsMutation.mutateAsync({
        capacityPerSlot,
        daysAhead,
        minLeadHours,
        closedWeekdays,
      });
      setSettingsMessage("Appointment settings saved.");
    } catch (err) {
      setSettingsError(err instanceof ApiError ? err.message : "Could not save settings.");
    }
  };

  const addBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) {
      setFormError("Choose a date.");
      return;
    }
    setFormError(null);
    try {
      await createMutation.mutateAsync({
        blockDate,
        slotTime: slotTime || undefined,
        reason: reason.trim() || undefined,
      });
      setBlockDate("");
      setSlotTime("");
      setReason("");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not add block.");
    }
  };

  const removeBlock = async (id: number) => {
    const ok = await confirm({
      title: "Remove appointment block?",
      description: "This slot will become bookable again for customers.",
      confirmLabel: "Remove",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // ignore — list will refresh on success
    }
  };

  return (
    <div>
      <ConfirmDialog />
      <h1 className="font-display text-2xl font-extrabold">Appointments</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Configure how many bookings each slot accepts, how far ahead customers can book, and block specific dates or times.
      </p>

      <Card className="mt-6">
        <CardContent className="space-y-4 p-5">
          <p className="font-display text-base font-bold">Availability settings</p>
          {settingsQuery.isLoading ? (
            <AdminInlineFieldsSkeleton rows={4} />
          ) : (
          <form onSubmit={saveSettings} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="capacity" className="mb-1.5 block">Bookings per slot</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  max={20}
                  value={capacityPerSlot}
                  onChange={(e) => setCapacityPerSlot(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="daysAhead" className="mb-1.5 block">Days ahead to show</Label>
                <Input
                  id="daysAhead"
                  type="number"
                  min={1}
                  max={30}
                  value={daysAhead}
                  onChange={(e) => setDaysAhead(Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="minLead" className="mb-1.5 block">Minimum lead time (hours)</Label>
                <Input
                  id="minLead"
                  type="number"
                  min={0}
                  max={72}
                  value={minLeadHours}
                  onChange={(e) => setMinLeadHours(Number(e.target.value))}
                  required
                />
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Closed weekdays</Label>
              <div className="flex flex-wrap gap-4">
                {WEEKDAYS.map((d) => (
                  <label key={d.value} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={closedWeekdays.includes(d.value)}
                      onCheckedChange={(v) => toggleWeekday(d.value, v === true)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Slot times: {slotTimes.join(", ")} (configured in app config)
            </p>
            <Button type="submit" disabled={saveSettingsMutation.isPending || settingsQuery.isLoading}>
              {saveSettingsMutation.isPending ? "Saving…" : "Save settings"}
            </Button>
            {settingsMessage && <p className="text-sm text-emerald-700">{settingsMessage}</p>}
            {settingsError && <p className="text-sm text-destructive">{settingsError}</p>}
          </form>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="space-y-4 p-5">
          <p className="font-display text-base font-bold">Block dates or times</p>
          <form onSubmit={addBlock} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="blockDate" className="mb-1.5 block">
                Date
              </Label>
              <Input
                id="blockDate"
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Time (optional)</Label>
              <Select value={slotTime || "__all__"} onValueChange={(v) => setSlotTime(v === "__all__" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Whole day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Whole day</SelectItem>
                  {SLOT_TIMES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="reason" className="mb-1.5 block">
                Reason (optional)
              </Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Staff training"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding…" : "Add block"}
              </Button>
            </div>
          </form>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </CardContent>
      </Card>

      {blocksQuery.isLoading ? (
        <AdminCardListSkeleton className="mt-6" count={4} />
      ) : (
      <div className="mt-6 space-y-3">
        {blocks.map((block) => (
          <Card key={block.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-display font-bold">
                  {block.blockDate}
                  {block.slotTime ? ` · ${block.slotTime}` : " · whole day"}
                </p>
                {block.reason && <p className="mt-1 text-sm text-muted-foreground">{block.reason}</p>}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => removeBlock(block.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
        {blocks.length === 0 && (
          <p className="text-sm text-muted-foreground">No blocks — all configured slots are open.</p>
        )}
      </div>
      )}

      <AdminPagination
        className="mt-6"
        meta={blocksMeta}
        page={page}
        onPageChange={setPage}
        isLoading={blocksQuery.isFetching}
      />
    </div>
  );
}
