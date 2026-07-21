import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { BasketItem, BasketSkuSnapshot, ServiceSelection, Voucher } from "@/types";
import { findVoucherByCode } from "@/lib/vouchers";

interface BasketPersistState {
  items: BasketItem[];
  serviceIds: number[];
  serviceSelections: Record<string, ServiceSelection>;
  notes: string;
  voucherCode?: string;
}

interface BasketContextValue {
  items: BasketItem[];
  serviceIds: number[];
  serviceSelections: Record<string, ServiceSelection>;
  voucher: Voucher | null;
  voucherError: string | null;
  notes: string;
  slot: { date: string; time: string } | null;
  addItem: (skuId: number, qty: number, snapshot?: BasketSkuSnapshot) => void;
  updateQty: (skuId: number, qty: number) => void;
  removeItem: (skuId: number) => void;
  syncItemSnapshot: (skuId: number, snapshot: BasketSkuSnapshot) => void;
  toggleService: (id: number, defaultSelection?: ServiceSelection) => void;
  setServiceSelection: (id: number, selection: ServiceSelection | null) => void;
  applyVoucher: (code: string, vouchers: Voucher[]) => void;
  clearVoucher: () => void;
  setNotes: (n: string) => void;
  setSlot: (slot: { date: string; time: string } | null) => void;
  clearBasket: () => void;
  totals: {
    subtotal: number;
    voucherDiscount: number;
    servicesTotal: number;
    total: number;
    itemCount: number;
  };
}

const BasketContext = createContext<BasketContextValue | undefined>(undefined);

const STORAGE_KEY = "eg-tyres-basket-v1";

function loadInitial(): BasketPersistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { items: [], serviceIds: [], serviceSelections: {}, notes: "" };
    }
    const parsed = JSON.parse(raw) as Partial<BasketPersistState>;
    return {
      items: parsed.items ?? [],
      serviceIds: parsed.serviceIds ?? [],
      serviceSelections: parsed.serviceSelections ?? {},
      notes: parsed.notes ?? "",
      voucherCode: parsed.voucherCode,
    };
  } catch {
    return { items: [], serviceIds: [], serviceSelections: {}, notes: "" };
  }
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const initial = loadInitial();
  const [items, setItems] = useState<BasketItem[]>(initial.items);
  const [serviceIds, setServiceIds] = useState<number[]>(initial.serviceIds);
  const [serviceSelections, setServiceSelections] = useState<Record<string, ServiceSelection>>(
    initial.serviceSelections,
  );
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [notes, setNotes] = useState(initial.notes);
  const [slot, setSlot] = useState<{ date: string; time: string } | null>(null);

  const persist = useCallback((next: BasketPersistState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // no-op
    }
  }, []);

  const snapshot = useCallback(
    (): BasketPersistState => ({
      items,
      serviceIds,
      serviceSelections,
      notes,
      voucherCode: voucher?.code,
    }),
    [items, serviceIds, serviceSelections, notes, voucher],
  );

  const addItem = useCallback((skuId: number, qty: number, snapshotData?: BasketSkuSnapshot) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.skuId === skuId);
      let next: BasketItem[];
      if (existing) {
        next = prev.map((i) =>
          i.skuId === skuId ? { ...i, qty: i.qty + qty, snapshot: i.snapshot ?? snapshotData } : i,
        );
      } else {
        next = [...prev, { skuId, qty, snapshot: snapshotData }];
      }
      persist({ ...snapshot(), items: next });
      return next;
    });
  }, [persist, snapshot]);

  const updateQty = useCallback((skuId: number, qty: number) => {
    setItems((prev) => {
      const next = qty <= 0 ? prev.filter((i) => i.skuId !== skuId) : prev.map((i) => (i.skuId === skuId ? { ...i, qty } : i));
      persist({ ...snapshot(), items: next });
      return next;
    });
  }, [persist, snapshot]);

  const removeItem = useCallback((skuId: number) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.skuId !== skuId);
      persist({ ...snapshot(), items: next });
      return next;
    });
  }, [persist, snapshot]);

  const syncItemSnapshot = useCallback((skuId: number, snapshotData: BasketSkuSnapshot) => {
    setItems((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        if (item.skuId !== skuId) return item;
        const same =
          item.snapshot?.brandId === snapshotData.brandId &&
          item.snapshot?.brandSlug === snapshotData.brandSlug &&
          item.snapshot?.pricePerTyre === snapshotData.pricePerTyre &&
          JSON.stringify(item.snapshot?.quantityTiers ?? []) === JSON.stringify(snapshotData.quantityTiers);

        if (same) return item;
        changed = true;
        return { ...item, snapshot: snapshotData };
      });

      if (!changed) return prev;
      persist({ ...snapshot(), items: next });
      return next;
    });
  }, [persist, snapshot]);

  const setServiceSelection = useCallback((id: number, selection: ServiceSelection | null) => {
    const key = String(id);
    setServiceSelections((prev) => {
      const next = { ...prev };
      if (!selection) {
        delete next[key];
      } else {
        next[key] = selection;
      }
      persist({ ...snapshot(), serviceSelections: next });
      return next;
    });
  }, [persist, snapshot]);

  const toggleService = useCallback((id: number, defaultSelection?: ServiceSelection) => {
    const key = String(id);
    const removing = serviceIds.includes(id);
    const nextIds = removing ? serviceIds.filter((s) => s !== id) : [...serviceIds, id];
    const nextSelections = { ...serviceSelections };

    if (removing) {
      delete nextSelections[key];
    } else if (defaultSelection) {
      nextSelections[key] = defaultSelection;
    }

    setServiceIds(nextIds);
    setServiceSelections(nextSelections);
    persist({
      items,
      serviceIds: nextIds,
      serviceSelections: nextSelections,
      notes,
      voucherCode: voucher?.code,
    });
  }, [items, serviceIds, serviceSelections, notes, voucher, persist]);

  const applyVoucher = useCallback((code: string, vouchers: Voucher[]) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setVoucher(null);
      setVoucherError(null);
      return;
    }
    const found = findVoucherByCode(vouchers, trimmed);
    if (!found) {
      setVoucher(null);
      setVoucherError(`Voucher code "${trimmed}" was not recognised.`);
      return;
    }
    const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
    if (totalQty < found.minQty) {
      setVoucher(null);
      setVoucherError(`Voucher "${found.code}" requires a minimum of ${found.minQty} tyres in the basket.`);
      return;
    }
    if (found.brandSlug) {
      const matchesBrand = items.some((item) => item.snapshot?.brandSlug === found.brandSlug);
      if (!matchesBrand) {
        setVoucher(null);
        setVoucherError(`Voucher "${found.code}" only applies to ${found.brandName} tyres.`);
        return;
      }
    }
    setVoucher(found);
    setVoucherError(null);
    persist({ ...snapshot(), voucherCode: found.code });
  }, [items, persist, snapshot]);

  const clearVoucher = useCallback(() => {
    setVoucher(null);
    setVoucherError(null);
    persist({ ...snapshot(), voucherCode: undefined });
  }, [persist, snapshot]);

  const clearBasket = useCallback(() => {
    setItems([]);
    setServiceIds([]);
    setServiceSelections({});
    setVoucher(null);
    setVoucherError(null);
    setNotes("");
    setSlot(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // no-op
    }
  }, []);

  const totals = useMemo(() => {
    let subtotal = 0;
    let itemCount = 0;
    for (const item of items) {
      if (!item.snapshot) continue;
      const tier = item.snapshot.quantityTiers
        .filter((t) => item.qty >= t.qty)
        .sort((a, b) => b.qty - a.qty)[0];
      const unit = tier?.pricePerTyre ?? item.snapshot.pricePerTyre;
      subtotal += unit * item.qty;
      itemCount += item.qty;
    }

    let voucherDiscount = 0;
    if (voucher) {
      let qualifyingQty = 0;
      if (voucher.brandSlug) {
        for (const item of items) {
          if (item.snapshot?.brandSlug === voucher.brandSlug) {
            qualifyingQty += item.qty;
          }
        }
      } else {
        qualifyingQty = itemCount;
      }
      voucherDiscount = qualifyingQty * voucher.discountPerQty;
    }

    const servicesTotal = 0;

    const total = Math.max(0, subtotal - voucherDiscount + servicesTotal);
    return { subtotal, voucherDiscount, servicesTotal, total, itemCount };
  }, [items, voucher]);

  const value: BasketContextValue = {
    items,
    serviceIds,
    serviceSelections,
    voucher,
    voucherError,
    notes,
    slot,
    addItem,
    updateQty,
    removeItem,
    syncItemSnapshot,
    toggleService,
    setServiceSelection,
    applyVoucher,
    clearVoucher,
    setNotes: (n: string) => {
      setNotes(n);
      persist({ ...snapshot(), notes: n });
    },
    setSlot,
    clearBasket,
    totals,
  };

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used within BasketProvider");
  return ctx;
}
