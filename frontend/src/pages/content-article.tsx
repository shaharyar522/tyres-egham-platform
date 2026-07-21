import { Navigate, useParams } from "react-router-dom";

/** Legacy URL support: /content/details/:id/:slug → /blog/:slug */
export default function ContentArticlePage() {
  const params = useParams();
  const slug = params.slug;
  if (!slug) return <Navigate to="/blog" replace />;
  return <Navigate to={`/blog/${slug}`} replace />;
}
