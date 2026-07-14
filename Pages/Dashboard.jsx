import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Building2, MapPin, Banknote, Users, ChevronLeft, Plus, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [apartments, setApartments] = useState([]);
  const [appCounts, setAppCounts] = useState({});
  const [newCounts, setNewCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [apts, apps] = await Promise.all([
        base44.entities.Apartment.filter({ is_deleted: false }, "-created_date"),
        base44.entities.Application.list("-created_date", 500)]
        );
        const counts = {};
        const newC = {};
        apps.forEach((a) => {
          counts[a.apartment_id] = (counts[a.apartment_id] || 0) + 1;
          if (a.status === "جديد") newC[a.apartment_id] = (newC[a.apartment_id] || 0) + 1;
        });
        setApartments(apts);
        setAppCounts(counts);
        setNewCounts(newC);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-5 space-y-4">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>);

  }

  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className="text-2xl font-bold font-heading">StudentRent</h1>
        <p className="text-muted-foreground text-sm mt-0.5">شققك في مكان واحد</p>
      </div>

      {apartments.length === 0 ?
      <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">ابدأ بنشر شقتك الأولى</h3>
          <p className="text-sm text-muted-foreground mb-5">انشر شقتك وانسخ رابط التقديم للطلاب</p>
          <Link to="/apartments/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium text-sm">
            <Plus className="w-4 h-4" />
            نشر شقة
          </Link>
        </div> :

      <div className="space-y-3">
          {apartments.map((apt) => {
          const newCount = newCounts[apt.id] || 0;
          return (
            <Link
              key={apt.id}
              to={`/apartments/${apt.id}`}
              className="block bg-surface rounded-xl border border-border p-5 active:scale-[0.98] transition-transform">
              
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <h3 className="font-semibold text-sm truncate">{apt.title}</h3>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${apt.status === "متاحة" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {apt.status}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3" />
                  {apt.location}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 font-bold text-primary">
                      <Banknote className="w-3.5 h-3.5" />
                      {apt.rent} ج.م
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {appCounts[apt.id] || 0} طلب
                    </span>
                  </div>
                  {newCount > 0 &&
                <span className="flex items-center gap-1 text-[10px] font-medium text-info bg-info/10 px-2 py-0.5 rounded-full">
                      <Bell className="w-3 h-3" />
                      {newCount} جديد
                    </span>
                }
                </div>
              </Link>);

        })}
        </div>
      }

      {/* FAB */}
      <Link
        to="/apartments/new"
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-5 h-12 rounded-lg shadow-lg active:scale-95 transition-transform">نشر شقة



      </Link>
    </div>);

}