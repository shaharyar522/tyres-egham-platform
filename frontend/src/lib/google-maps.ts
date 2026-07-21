export function googleMapsEmbedUrl(address: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

export function googleMapsDirectionsUrl(address: string, placeUrl?: string | null): string {
  if (placeUrl?.trim()) {
    return placeUrl.trim();
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export function whatsAppUrl(phoneTel: string): string {
  const digits = phoneTel.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? `44${digits.slice(1)}` : digits;

  return `https://wa.me/${intl}`;
}
