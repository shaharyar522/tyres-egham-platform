import { useEffect, useState } from "react";
import { Cookie, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "eg-tyres-cookie-consent-v1";

export function CookieConsent() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const decision = localStorage.getItem(STORAGE_KEY);
    if (!decision) {
      const t = setTimeout(() => setShown(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const decide = (decision: "accept" | "reject" | "manage") => {
    try {
      localStorage.setItem(STORAGE_KEY, decision);
    } catch {
      // no-op
    }
    setShown(false);
  };

  if (!shown) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background shadow-elev-3 animate-fade-in-up">
      <div className="container flex flex-col gap-3 py-4 md:flex-row md:items-center md:gap-6">
        <div className="flex items-start gap-3 md:flex-1">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-foreground">
            We use cookies to make this site work, measure performance, and improve your experience. You can accept all,
            reject non-essential, or manage your preferences. Read our{" "}
            <a href="/cookies" className="text-primary underline-offset-2 hover:underline">cookie policy</a>.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => decide("manage")} className="gap-1.5">
            <Settings2 className="h-4 w-4" /> Manage
          </Button>
          <Button variant="outline" size="sm" onClick={() => decide("reject")}>Reject non-essential</Button>
          <Button size="sm" variant="cta" onClick={() => decide("accept")}>Accept all</Button>
        </div>
      </div>
    </div>
  );
}
