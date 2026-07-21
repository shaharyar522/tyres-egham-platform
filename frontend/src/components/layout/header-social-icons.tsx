import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function SocialIconLink({
  href,
  label,
  children,
  className,
}: {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-primary",
        className,
      )}
    >
      {children}
    </a>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4 fill-current", className)} aria-hidden="true">
      <path d="M13.5 8.5H15V6h-1.5C11.57 6 10.5 7.07 10.5 8.75V10H9v2.25h1.5V18H13.5v-5.75H15l.375-2.25H13.5V9.25c0-.69.56-1.25 1.25-1.25Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4 fill-none stroke-current stroke-[1.75]", className)} aria-hidden="true">
      <rect x="4.5" y="4.5" width="15" height="15" rx="4" />
      <circle cx="12" cy="12" r="3.25" />
      <circle cx="17.2" cy="6.8" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-4 w-4 fill-current", className)} aria-hidden="true">
      <path d="M16.5 5.25c.96.72 2.14 1.14 3.42 1.17V9.9a5.86 5.86 0 0 1-3.42-.99v6.34a4.35 4.35 0 1 1-4.35-4.35c.22 0 .44.02.65.06v2.58a1.78 1.78 0 1 0 1.26 1.7V5.25h2.44Z" />
    </svg>
  );
}

export function HeaderSocialIcons({
  facebookUrl,
  instagramUrl,
  tiktokUrl,
  className,
}: {
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  className?: string;
}) {
  const links = [
    facebookUrl ? { href: facebookUrl, label: "Facebook", Icon: FacebookIcon } : null,
    instagramUrl ? { href: instagramUrl, label: "Instagram", Icon: InstagramIcon } : null,
    tiktokUrl ? { href: tiktokUrl, label: "TikTok", Icon: TikTokIcon } : null,
  ].filter(Boolean) as Array<{ href: string; label: string; Icon: typeof FacebookIcon }>;

  if (links.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {links.map(({ href, label, Icon }) => (
        <SocialIconLink key={label} href={href} label={label}>
          <Icon />
        </SocialIconLink>
      ))}
    </div>
  );
}
