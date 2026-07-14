import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LogOut, Mail, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  function handleLogout() {
    base44.auth.logout("/login");
  }

  if (loading) {
    return <div className="p-5"><Skeleton className="h-20 w-full rounded-xl" /></div>;
  }

  return (
    <div className="p-5 space-y-6">
      <h1 className="text-2xl font-bold font-heading">حسابي</h1>

      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{user?.full_name || "مستخدم"}</p>
            {user?.email && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3" />{user.email}
              </p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 bg-surface rounded-xl border border-border text-danger hover:bg-danger/10 transition-colors text-sm font-medium"
      >
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </button>
    </div>
  );
}