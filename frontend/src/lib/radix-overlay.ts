/** True when the event target is inside tyre search UI that must not close the nav menu. */
export function isTyreSearchOverlayTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  return Boolean(
    target.closest("[data-tyre-search-mega-panel]") ||
      target.closest("[data-radix-select-content]") ||
      target.closest("[data-radix-select-viewport]") ||
      target.closest("[data-radix-popper-content-wrapper]") ||
      target.closest('[role="listbox"]'),
  );
}

/** @deprecated Use isTyreSearchOverlayTarget */
export const isRadixSelectOverlayTarget = isTyreSearchOverlayTarget;

/** Keep Navigation Menu open while interacting with a portalled select dropdown. */
export function preventNavMenuDismissForSelect(event: Event) {
  if (isTyreSearchOverlayTarget(event.target)) {
    event.preventDefault();
  }
}
