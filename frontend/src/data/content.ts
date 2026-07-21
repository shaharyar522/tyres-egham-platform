import type { ContentArticle } from "@/types";

export const CONTENT: ContentArticle[] = [
  { id: 1, slug: "buying-premium-vs-budget-tyres", title: "Buying Premium vs Budget Tyres", excerpt: "What you actually pay for when you go premium - and when budget is the smarter call.", category: "buying-guide", readMinutes: 6, publishedAt: "2026-03-12", imageEmoji: "\ud83d\udcb0" },
  { id: 2, slug: "winter-tyres-explained", title: "Winter Tyres Explained", excerpt: "Why M+S and 3PMSF matter, when to switch, and what they cost over a season.", category: "seasonal", readMinutes: 7, publishedAt: "2026-02-28", imageEmoji: "\u2744\ufe0f" },
  { id: 3, slug: "tyre-pressure-guide", title: "The Definitive Tyre Pressure Guide", excerpt: "How to find your manufacturer pressure, when to check it, and how loading changes the answer.", category: "maintenance", readMinutes: 5, publishedAt: "2026-02-14", imageEmoji: "\ud83c\udf2c\ufe0f" },
  { id: 4, slug: "tyre-wall-markings", title: "Reading Tyre Wall Markings", excerpt: "Decode every number, letter and symbol on the sidewall - including OE markings and DOT codes.", category: "buying-guide", readMinutes: 8, publishedAt: "2026-01-30", imageEmoji: "\ud83d\udd24" },
  { id: 5, slug: "ev-tyres-what-to-know", title: "EV Tyres: What You Need to Know", excerpt: "Why EVs eat tyres faster, what to look for, and which brands lead on EV-rated ranges.", category: "buying-guide", readMinutes: 6, publishedAt: "2026-01-18", imageEmoji: "\u26a1" },
  { id: 6, slug: "wheel-alignment-when-needed", title: "When Do You Need a Wheel Alignment?", excerpt: "The five signs you should book one - and the cost of ignoring them.", category: "maintenance", readMinutes: 4, publishedAt: "2026-01-04", imageEmoji: "\ud83c\udfaf" },
  { id: 7, slug: "puncture-repair-rules", title: "Puncture Repair: What's Legal, What's Not", excerpt: "BS AU 159, the central tread zone, and why some repairs simply cannot be done.", category: "safety", readMinutes: 5, publishedAt: "2025-12-19", imageEmoji: "\ud83d\udd27" },
  { id: 8, slug: "all-season-vs-summer-tyres", title: "All Season vs Summer Tyres", excerpt: "What the UK climate really demands, and whether all-season is the smarter year-round choice.", category: "buying-guide", readMinutes: 6, publishedAt: "2025-12-05", imageEmoji: "\u2600\ufe0f" },
];

export const getArticleBySlug = (slug: string) => CONTENT.find((c) => c.slug === slug);
