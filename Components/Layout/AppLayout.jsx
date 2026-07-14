import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, Bell, User } from "lucide-react";

const navItems = [
  { label: "الرئيسية", path: "/", icon: Home, exact: true },
  { label: "الإشعارات", path: "/notifications", icon: Bell },
  { label: "حسابي", path: "/account", icon: User },
];

export default function AppLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-[480px] mx-auto bg-background min-h-screen relative shadow-sm">
        <main className="pb-24 min-h-screen">
          <Outlet />
        </main>
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-popover border-t border-border z-50">
          <div className="grid grid-cols-3">
            {navItems.map(item => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 py-3 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}