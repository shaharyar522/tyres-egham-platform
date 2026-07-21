import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Clock,
  Link2,
  MessageCircle,
  Search,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blogCategoryLabel, blogPostPath } from "@/lib/blog";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { ContentArticle } from "@/types";

function SidebarCard({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card", className)}>
      <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-5 py-3.5">
        {icon}
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function BlogSearchBox({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/blog?q=${encodeURIComponent(q)}` : "/blog");
  };

  return (
    <form onSubmit={submit} className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className="h-11 rounded-xl border-border/80 bg-background pl-10 pr-24"
          aria-label="Search blog articles"
        />
        <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-lg px-3 text-xs">
          Search
        </Button>
      </div>
    </form>
  );
}

function BlogPostThumb({ article, compact }: { article: ContentArticle; compact?: boolean }) {
  return (
    <Link
      to={blogPostPath(article.slug)}
      className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/30">
        {article.featuredImageUrl ? (
          <img src={article.featuredImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-2xl">
            {article.imageEmoji || "📝"}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-display text-sm font-bold leading-snug text-foreground group-hover:text-primary">
          {article.title}
        </p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          {article.readMinutes} min
          {!compact && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{blogCategoryLabel(article.category)}</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

export function BlogLatestPosts({
  articles,
  excludeId,
  limit = 3,
}: {
  articles: ContentArticle[];
  excludeId?: number;
  limit?: number;
}) {
  const latest = articles.filter((a) => a.id !== excludeId).slice(0, limit);

  if (latest.length === 0) {
    return <p className="text-sm text-muted-foreground">No other posts yet.</p>;
  }

  return (
    <ul className="space-y-1">
      {latest.map((article) => (
        <li key={article.id}>
          <BlogPostThumb article={article} />
        </li>
      ))}
    </ul>
  );
}

function SocialIcon({ name, className }: { name: string; className?: string }) {
  const cn = className ?? "h-4 w-4";
  switch (name) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn} aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn} aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn} aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn} aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn} aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
        </svg>
      );
    case "google":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn} aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    default:
      return <Share2 className={cn} aria-hidden />;
  }
}

export function BlogSocialShare({ title, slug }: { title: string; slug: string }) {
  const site = useSite();
  const [copied, setCopied] = useState(false);

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${site.canonicalBaseUrl?.replace(/\/$/, "") ?? ""}/blog/${slug}`;

  const shareLinks = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
      icon: "facebook",
    },
    {
      label: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`,
      icon: "x",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
      icon: "linkedin",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${pageUrl}`)}`,
      icon: "whatsapp",
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const followLinks = [
    { label: "Facebook", href: site.facebookUrl, icon: "facebook" },
    { label: "Instagram", href: site.instagramUrl, icon: "instagram" },
    { label: "TikTok", href: site.tiktokUrl, icon: "tiktok" },
    { label: "Google", href: site.googleBusinessUrl, icon: "google" },
  ].filter((l) => Boolean(l.href));

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Share this article</p>
        <div className="flex flex-wrap gap-2">
          {shareLinks.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              aria-label={`Share on ${label}`}
              title={label}
            >
              {icon === "whatsapp" ? <MessageCircle className="h-4 w-4" /> : <SocialIcon name={icon} />}
            </a>
          ))}
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            aria-label="Copy link"
            title={copied ? "Copied!" : "Copy link"}
          >
            <Link2 className="h-4 w-4" />
          </button>
        </div>
        {copied && <p className="mt-2 text-xs text-primary">Link copied to clipboard</p>}
      </div>

      {followLinks.length > 0 && (
        <div className="border-t border-border/60 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Follow us</p>
          <div className="flex flex-wrap gap-2">
            {followLinks.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <SocialIcon name={icon} />
                {label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BlogSidebar({
  articles,
  currentArticleId,
  currentSlug,
  currentTitle,
  className,
}: {
  articles: ContentArticle[];
  currentArticleId?: number;
  currentSlug?: string;
  currentTitle?: string;
  className?: string;
}) {
  return (
    <aside className={cn("space-y-6 lg:sticky lg:top-24 lg:self-start", className)}>
      <SidebarCard title="Search blog" icon={<Search className="h-4 w-4 text-primary" />}>
        <BlogSearchBox />
      </SidebarCard>

      <SidebarCard title="Latest posts" icon={<Clock className="h-4 w-4 text-primary" />}>
        <BlogLatestPosts articles={articles} excludeId={currentArticleId} limit={3} />
        <Link
          to="/blog"
          className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
        >
          View all articles →
        </Link>
      </SidebarCard>

      {currentSlug && currentTitle && (
        <SidebarCard title="Share" icon={<Share2 className="h-4 w-4 text-primary" />}>
          <BlogSocialShare title={currentTitle} slug={currentSlug} />
        </SidebarCard>
      )}
    </aside>
  );
}
