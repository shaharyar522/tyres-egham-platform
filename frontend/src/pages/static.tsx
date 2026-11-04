import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api/client";
import { useApiBootstrapQuery, useApiHealthQuery } from "@/lib/api/queries";
export default function StaticPage({ title, body }: { title: string; body: string }) {
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="font-display text-3xl font-extrabold sm:text-display-lg">{title}</h1>
      <div className="prose prose-sm mt-6 max-w-none text-foreground">
        <p>{body}</p>
        <p>This content is managed from the admin CMS.</p>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="container max-w-3xl py-20 text-center">
      <h1 className="font-display text-5xl font-extrabold">404</h1>
      <p className="mt-2 text-muted-foreground">We couldn't find that page.</p>
      <Button asChild className="mt-6"><Link to="/">Back to homepage</Link></Button>
    </div>
  );
}

export function AdminStub() {
  const health = useApiHealthQuery();
  const bootstrap = useApiBootstrapQuery();
  const healthData = health.data;
  const bootstrapData = bootstrap.data;

  return (
    <div className="container max-w-3xl py-20 text-center">
      <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
      <h1 className="mt-4 font-display text-3xl font-extrabold">Admin dashboard</h1>
      <p className="mt-2 max-w-xl mx-auto text-muted-foreground">
        Use the staff login to manage site settings, catalogue, vouchers, bookings and reviews.
      </p>
      <div className="mx-auto mt-6 max-w-xl rounded-lg border bg-[#f8f8f8] p-4 text-left text-sm">
        <p className="font-bold text-slate-900">API status</p>
        <p className="mt-1 text-slate-600">
          Frontend API base: <span className="font-mono">{getApiBaseUrl()}</span>
        </p>
        <div className="mt-3 space-y-2">
          <p className="text-slate-800">
            Backend health:{" "}
            {health.isLoading ? "Checking..." : health.isError || !healthData ? "Unavailable" : `${healthData.status} (${healthData.database} database)`}
          </p>
          <p className="text-slate-800">
            Bootstrap payload:{" "}
            {bootstrap.isLoading
              ? "Loading..."
              : bootstrap.isError || !bootstrapData
                ? "Unavailable"
                : `${bootstrapData.stats.brands} brands, ${bootstrapData.stats.categories} categories, ${bootstrapData.stats.skus} SKUs`}
          </p>
          {!bootstrap.isLoading && !bootstrap.isError && bootstrapData && (
            <div className="rounded border bg-white p-3 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Live data preview</p>
              <p className="mt-1">Top brands: {bootstrapData.brands.slice(0, 4).map((brand) => brand.name).join(", ")}</p>
              <p className="mt-1">Services: {bootstrapData.services.map((service) => service.name).join(", ")}</p>
              <p className="mt-1">Sample areas: {bootstrapData.areas.slice(0, 3).map((area) => area.name).join(", ")}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-xl rounded-lg border-2 border-emerald-300 bg-emerald-50 p-4 text-left text-sm text-emerald-900">
        <p className="font-bold">Within 24 hours - admin controlled</p>
        <p className="mt-1">
          Per-SKU `Within 24 hours` toggle (with bulk action) lives in the Catalog editor. When enabled, that SKU renders as a full green express-fitting card on the public listing.
        </p>
      </div>
      <Button asChild className="mt-6"><Link to="/admin/login">Go to admin login</Link></Button>
    </div>
  );
}
