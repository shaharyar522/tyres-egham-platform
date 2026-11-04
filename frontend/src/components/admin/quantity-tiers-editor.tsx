import { useEffect, useId, useMemo, useState } from "react";
import { Plus, Trash2, Zap, RotateCcw, Code, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatGBP } from "@/lib/utils";
import type { QuantityTier } from "@/types";

interface QuantityTiersEditorProps {
  value: string;
  onChange: (newJson: string) => void;
  basePrice?: number;
}

export function QuantityTiersEditor({ value, onChange, basePrice = 0 }: QuantityTiersEditorProps) {
  const editorId = useId();
  const [showRawJson, setShowRawJson] = useState(false);
  const [rawText, setRawText] = useState(value);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Sync incoming value to local raw text if not actively editing raw
  useEffect(() => {
    setRawText(value);
  }, [value]);

  // Safely parse the JSON value into array of QuantityTier
  const tiers: QuantityTier[] = useMemo(() => {
    if (!value || !value.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          qty: Number(item.qty) || 1,
          pricePerTyre: Number(item.pricePerTyre) || 0,
          saveLabel: typeof item.saveLabel === "string" ? item.saveLabel : undefined,
        }));
      }
      return [];
    } catch {
      return [];
    }
  }, [value]);

  const updateTiers = (newTiers: QuantityTier[]) => {
    // Sort tiers by qty ascending
    const sorted = [...newTiers].sort((a, b) => a.qty - b.qty);
    const jsonString = JSON.stringify(sorted, null, 2);
    setRawText(jsonString);
    setJsonError(null);
    onChange(jsonString);
  };

  const handleRowChange = (index: number, field: keyof QuantityTier, val: unknown) => {
    const updated = [...tiers];
    if (!updated[index]) return;

    if (field === "qty") {
      updated[index] = { ...updated[index], qty: Math.max(1, Number(val) || 1) };
    } else if (field === "pricePerTyre") {
      const newPrice = Math.max(0, Number(val) || 0);
      const row = { ...updated[index], pricePerTyre: newPrice };
      // Auto-update saveLabel if basePrice exists and saving is positive
      if (basePrice > 0 && newPrice < basePrice) {
        const totalSavings = Math.round((basePrice - newPrice) * row.qty);
        if (totalSavings > 0) {
          row.saveLabel = `Save £${totalSavings}`;
        }
      }
      updated[index] = row;
    } else if (field === "saveLabel") {
      const text = String(val);
      updated[index] = { ...updated[index], saveLabel: text.trim() ? text : undefined };
    }

    updateTiers(updated);
  };

  const handleAddTier = () => {
    const existingQtys = new Set(tiers.map((t) => t.qty));
    let nextQty = 2;
    if (existingQtys.has(2)) nextQty = 4;
    else if (existingQtys.has(4)) nextQty = 3;
    else if (existingQtys.size > 0) {
      nextQty = Math.max(...Array.from(existingQtys)) + 1;
    }

    const defaultPrice = basePrice > 0 ? (nextQty >= 4 ? Math.max(1, basePrice - 8) : Math.max(1, basePrice - 4)) : 0;
    const totalSavings = basePrice > 0 && defaultPrice < basePrice ? Math.round((basePrice - defaultPrice) * nextQty) : 0;

    const newTier: QuantityTier = {
      qty: nextQty,
      pricePerTyre: defaultPrice,
      saveLabel: totalSavings > 0 ? `Save £${totalSavings}` : undefined,
    };

    updateTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index);
    updateTiers(updated);
  };

  const handleGenerateStandard = () => {
    const price = Number(basePrice) || 0;
    if (price <= 0) {
      // Create empty 1, 2, 4 tiers
      updateTiers([
        { qty: 1, pricePerTyre: 0 },
        { qty: 2, pricePerTyre: 0, saveLabel: "Save £8" },
        { qty: 4, pricePerTyre: 0, saveLabel: "Save £32" },
      ]);
      return;
    }

    const tier2Price = Math.max(1, Math.round((price - 4) * 100) / 100);
    const tier4Price = Math.max(1, Math.round((price - 8) * 100) / 100);

    const standardTiers: QuantityTier[] = [
      { qty: 1, pricePerTyre: price },
      {
        qty: 2,
        pricePerTyre: tier2Price,
        saveLabel: `Save £${Math.round((price - tier2Price) * 2)}`,
      },
      {
        qty: 4,
        pricePerTyre: tier4Price,
        saveLabel: `Save £${Math.round((price - tier4Price) * 4)}`,
      },
    ];

    updateTiers(standardTiers);
  };

  const handleClearAll = () => {
    updateTiers([]);
  };

  const handleRawTextChange = (text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setJsonError(null);
      onChange("");
      return;
    }
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setJsonError("JSON must be an array of objects e.g. [{\"qty\":1,\"pricePerTyre\":189}]");
        return;
      }
      setJsonError(null);
      onChange(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid JSON format";
      setJsonError(msg);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-semibold">Quantity Tiers (Volume Discounts)</Label>
            {tiers.length > 0 && (
              <Badge variant="outline" className="bg-background text-xs">
                {tiers.length} {tiers.length === 1 ? "tier" : "tiers"} active
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Offer customer discounts when buying 2 or 4 tyres (e.g. 1 tyre @ £{basePrice > 0 ? basePrice : "100"}, 4 tyres @ £{basePrice > 0 ? Math.max(1, basePrice - 8) : "92"}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerateStandard}
            className="h-8 gap-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            title="Automatically generates standard 1, 2, and 4 tyre discount tiers based on base price"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Auto-generate (1, 2, 4)
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddTier}
            className="h-8 gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Add Tier
          </Button>

          {tiers.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-destructive"
              title="Clear all quantity tiers"
            >
              <RotateCcw className="h-3 w-3" /> Clear
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowRawJson((prev) => !prev)}
            className="h-8 gap-1 text-xs text-muted-foreground"
            title="Toggle raw JSON editor"
          >
            <Code className="h-3.5 w-3.5" />
            {showRawJson ? "Hide JSON" : "Edit JSON"}
          </Button>
        </div>
      </div>

      {/* Visual Tiers Table */}
      {tiers.length === 0 ? (
        <div className="rounded-md border border-dashed bg-background/60 p-4 text-center">
          <p className="text-xs text-muted-foreground">
            No volume discount tiers configured yet (standard single tyre price applies).
          </p>
          <div className="mt-2 flex justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleGenerateStandard}
              className="h-7 text-xs font-medium"
            >
              <Zap className="mr-1 h-3 w-3 text-amber-500" /> Click to auto-generate standard 1, 2 & 4 tyre tiers
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border bg-background">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead className="border-b bg-muted/40 font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="p-2.5 w-24">Quantity</th>
                <th className="p-2.5 w-36">Price Per Tyre (£)</th>
                <th className="p-2.5 w-32">Total Price</th>
                <th className="p-2.5">Badge / Save Label</th>
                <th className="p-2.5 w-12 text-center" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {tiers.map((tier, idx) => {
                const totalPrice = tier.qty * tier.pricePerTyre;
                const savingsPerTyre = basePrice > 0 ? basePrice - tier.pricePerTyre : 0;
                const totalSavings = savingsPerTyre > 0 ? savingsPerTyre * tier.qty : 0;

                return (
                  <tr key={idx} className="hover:bg-muted/20">
                    <td className="p-2">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          min="1"
                          max="99"
                          value={tier.qty}
                          onChange={(e) => handleRowChange(idx, "qty", e.target.value)}
                          className="h-8 w-20 text-xs font-semibold"
                        />
                        <span className="text-muted-foreground text-[11px] whitespace-nowrap">
                          {tier.qty === 1 ? "tyre" : "tyres"}
                        </span>
                      </div>
                    </td>

                    <td className="p-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs text-muted-foreground">£</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={tier.pricePerTyre}
                          onChange={(e) => handleRowChange(idx, "pricePerTyre", e.target.value)}
                          className="h-8 pl-6 text-xs font-semibold"
                        />
                      </div>
                    </td>

                    <td className="p-2">
                      <div className="font-semibold text-foreground">
                        {formatGBP(totalPrice)}
                      </div>
                      {totalSavings > 0 && (
                        <div className="text-[10px] text-emerald-600 font-medium">
                          Saves {formatGBP(totalSavings)} vs base
                        </div>
                      )}
                    </td>

                    <td className="p-2">
                      <Input
                        type="text"
                        placeholder={totalSavings > 0 ? `e.g. Save £${Math.round(totalSavings)}` : "Optional badge label"}
                        value={tier.saveLabel ?? ""}
                        onChange={(e) => handleRowChange(idx, "saveLabel", e.target.value)}
                        className="h-8 text-xs placeholder:text-muted-foreground/60"
                      />
                    </td>

                    <td className="p-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemoveTier(idx)}
                        title={`Remove ${tier.qty} tyre tier`}
                        aria-label={`Remove tier for ${tier.qty} tyres`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Raw JSON Mode (for developers / advanced use) */}
      {showRawJson && (
        <div className="mt-3 space-y-2 rounded-md border border-border/80 bg-background p-3">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${editorId}-raw`} className="text-xs font-semibold flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5 text-muted-foreground" />
              Raw JSON Data
            </Label>
            {jsonError ? (
              <Badge variant="destructive" className="text-[10px] gap-1 py-0">
                <AlertCircle className="h-3 w-3" /> Syntax Error
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 bg-emerald-50 gap-1 py-0">
                <CheckCircle2 className="h-3 w-3" /> Valid JSON
              </Badge>
            )}
          </div>

          <Textarea
            id={`${editorId}-raw`}
            className="font-mono text-xs"
            rows={5}
            value={rawText}
            onChange={(e) => handleRawTextChange(e.target.value)}
            placeholder='[{"qty":1,"pricePerTyre":189},{"qty":2,"pricePerTyre":185,"saveLabel":"Save £8"},{"qty":4,"pricePerTyre":181,"saveLabel":"Save £32"}]'
          />

          {jsonError && (
            <p className="text-xs text-destructive font-medium">
              {jsonError}
            </p>
          )}

          <p className="text-[11px] text-muted-foreground">
            Any edits here update the visual table automatically. The format is a JSON array with <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">qty</code>, <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">pricePerTyre</code>, and optional <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">saveLabel</code>.
          </p>
        </div>
      )}
    </div>
  );
}
