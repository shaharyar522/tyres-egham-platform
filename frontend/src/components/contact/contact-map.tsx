import { ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { googleMapsDirectionsUrl, googleMapsEmbedUrl } from "@/lib/google-maps";
import { cn } from "@/lib/utils";

export function ContactMap({
  address,
  businessName,
  placeUrl,
  className,
}: {
  address: string;
  businessName: string;
  placeUrl?: string | null;
  className?: string;
}) {
  const embedSrc = googleMapsEmbedUrl(address);
  const directionsHref = googleMapsDirectionsUrl(address, placeUrl);

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
          </span>
          <div>
            <p className="font-display text-sm font-bold text-[#1c2748]">Find our workshop</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{address}</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
          <a href={directionsHref} target="_blank" rel="noopener noreferrer">
            Get directions
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </Button>
      </div>

      <div className="relative aspect-[16/10] min-h-[280px] w-full bg-muted sm:min-h-[320px]">
        <iframe
          title={`Map showing ${businessName} location`}
          src={embedSrc}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  );
}
