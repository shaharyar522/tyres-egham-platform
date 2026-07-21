import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  Calendar,
  CalendarOff,
  CreditCard,
  FileText,
  Globe,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  Star,
  Tag,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLogo } from "@/components/domain/site-logo";
import { clearAdminSession, getAdminUser } from "@/lib/admin/auth";
import { adminPost } from "@/lib/admin/client";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type AdminNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

export const adminNav: AdminNavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/tyres", label: "Catalogue", icon: Package },
  { to: "/admin/brands", label: "Brands", icon: Tag },
  { to: "/admin/categories", label: "Categories", icon: Layers },
  { to: "/admin/vouchers", label: "Vouchers", icon: Ticket },
  { to: "/admin/content", label: "Content", icon: FileText },
  { to: "/admin/site-settings", label: "Site", icon: Globe },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarOff },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/account", label: "Account", icon: KeyRound },
];

type AdminSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
  const location = useLocation();
  const user = getAdminUser();

  const logout = async () => {
    try {
      await adminPost("/logout");
    } catch {
      // ignore
    }
    clearAdminSession();
    window.location.href = "/admin/login";
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-white", className)}>
      <div className="border-b p-4">
        <SiteLogo imageClassName="h-9 max-w-full" />
        <p className="mt-2 text-xs text-muted-foreground">Admin</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {adminNav.map((item) => {
          const active = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start gap-2"
          onClick={() => {
            onNavigate?.();
            void logout();
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

export function adminNavLabel(pathname: string): string {
  const match = adminNav.find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  );
  return match?.label ?? "Admin";
}
