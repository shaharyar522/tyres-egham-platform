export type AdminListMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

export type AdminListParams = Record<string, string | number | boolean | undefined>;

export function buildAdminListQuery(params: AdminListParams): string {
  const qs = new URLSearchParams();
  const page = params.page;
  const perPage = params.perPage;

  if (typeof page === "number" && page > 1) {
    qs.set("page", String(page));
  }
  if (typeof perPage === "number" && perPage > 0) {
    qs.set("perPage", String(perPage));
  }

  for (const [key, value] of Object.entries(params)) {
    if (key === "page" || key === "perPage") continue;
    if (value === undefined || value === "" || value === false) continue;
    qs.set(key, String(value));
  }

  return qs.toString();
}

import { useEffect, useState } from "react";

export function useAdminListPage(resetDeps: readonly unknown[] = []) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when filter/search deps change
  }, resetDeps);

  return { page, setPage };
}

export function adminListRange(meta: AdminListMeta | undefined): string | null {
  if (!meta || meta.total === 0) return null;
  const start = (meta.currentPage - 1) * meta.perPage + 1;
  const end = Math.min(meta.currentPage * meta.perPage, meta.total);
  return `${start}–${end} of ${meta.total}`;
}
