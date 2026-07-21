import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminListRange, type AdminListMeta } from "@/lib/admin/pagination";

type AdminPaginationProps = {
  meta: AdminListMeta | undefined;
  page: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
};

export function AdminPagination({ meta, page, onPageChange, isLoading, className }: AdminPaginationProps) {
  if (!meta || meta.total === 0) return null;

  const range = adminListRange(meta);
  const canPrev = page > 1;
  const canNext = page < meta.lastPage;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4${className ? ` ${className}` : ""}`}
    >
      {range && <p className="text-sm text-muted-foreground">{range}</p>}
      {meta.lastPage > 1 && (
        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canPrev || isLoading}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="min-w-[7rem] text-center text-sm text-muted-foreground">
            Page {meta.currentPage} of {meta.lastPage}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canNext || isLoading}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
