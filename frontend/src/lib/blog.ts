import type { ContentArticle } from "@/types";

export type BlogCategory = ContentArticle["category"];

export function blogCategoryLabel(category: BlogCategory): string {
  switch (category) {
    case "buying-guide":
      return "Buying guides";
    case "maintenance":
      return "Maintenance";
    case "safety":
      return "Safety";
    case "seasonal":
      return "Seasonal";
    default:
      return category.replace(/-/g, " ");
  }
}

export const blogCategoryOrder: BlogCategory[] = ["buying-guide", "maintenance", "safety", "seasonal"];

export function groupBlogPostsByCategory(articles: ContentArticle[]): Map<BlogCategory, ContentArticle[]> {
  const map = new Map<BlogCategory, ContentArticle[]>();
  for (const article of articles) {
    const list = map.get(article.category) ?? [];
    list.push(article);
    map.set(article.category, list);
  }
  return map;
}

export function buildBlogPostMeta(article: ContentArticle, businessName: string) {
  return {
    title: article.metaTitle ?? `${article.title} | ${businessName}`,
    description: article.metaDescription ?? article.excerpt,
    keywords: article.metaKeywords ?? undefined,
    robots: article.robots ?? undefined,
    ogImage: article.ogImageUrl ?? article.featuredImageUrl ?? undefined,
    canonicalPath: `/blog/${article.slug}`,
  };
}

export function filterBlogPosts(articles: ContentArticle[], query: string): ContentArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return articles;
  return articles.filter(
    (article) =>
      article.title.toLowerCase().includes(q) ||
      article.excerpt.toLowerCase().includes(q) ||
      blogCategoryLabel(article.category).toLowerCase().includes(q),
  );
}

export function blogPostPath(slug: string) {
  return `/blog/${slug}`;
}
