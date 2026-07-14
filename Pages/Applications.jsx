import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import StatusBadge from "@/components/StatusBadge";
import FilterSheet from "@/components/workspace/FilterSheet";
import { ArrowRight, Search, FileText, X, GraduationCap, Building2, MapPin, Users, Calendar } from "lucide-react";
import { GOVERNORATES, UNIVERSITIES } from "@/lib/constants";
import moment from "moment";

const FILTERS = [
  { key: "university", label: "الجامعة", icon: GraduationCap },
  { key: "faculty", label: "الكلية", icon: Building2 },
  { key: "governorate", label: "المحافظة", icon: MapPin },
  { key: "applying_as", label: "فرد/مجموعة", icon: Users },
  { key: "move_in_date", label: "تاريخ السكن", icon: Calendar }
];

export default function Applications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apartment, setApartment] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [openSheet, setOpenSheet] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [apt, apps] = await Promise.all([
          base44.entities.Apartment.get(id),
          base44.entities.Application.filter({ apartment_id: id }, "-created_date")
        ]);
        setApartment(apt);
        setApplications(apps);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Build unique options from applications
  const options = {
    university: [...new Set(applications.map(a => a.university).filter(Boolean))].sort(),
    faculty: [...new Set(applications.map(a => a.faculty).filter(Boolean))].sort(),
    governorate: GOVERNORATES,
    applying_as: ["فرد", "مجموعة"]
  };

  function setFilter(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  function clearFilter(key) {
    setFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  const filtered = applications.filter(app => {
    if (search) {
      const q = search.toLowerCase();
      const matches = (app.full_name || "").toLowerCase().includes(q) ||
        (app.phone || "").includes(search) ||
        (app.university || "").toLowerCase().includes(q);
      if (!matches) return false;
    }
    for (const [key, value] of Object.entries(filters)) {
      if (key === "move_in_date") {
        if (app.move_in_date !== value) return false;
      } else if (app[key] !== value) {
        return false;
      }
    }
    return true;
  });

  // Get unique move-in dates for filter sheet
  const moveInDates = [...new Set(applications.map(a => a.move_in_date).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="p-5 space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-popover/95 backdrop-blur border-b border-border">
        <div className="px-5 py-3 flex items-center gap-3">
          <button onClick={() => navigate(`/apartments/${id}`)} className="text-muted-foreground hover:text-foreground">
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sm truncate">{apartment?.title}</h1>
            <p className="text-[10px] text-muted-foreground">الطلبات</p>
          </div>
        </div>
        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الهاتف..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 px-5">
          {FILTERS.map(filter => {
            const value = filters[filter.key];
            const isActive = !!value;
            return (
              <button
                key={filter.key}
                onClick={() => {
                  if (filter.key === "move_in_date") {
                    setOpenSheet("move_in_date");
                  } else {
                    setOpenSheet(filter.key);
                  }
                }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-medium transition-colors min-h-[48px] ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface text-muted-foreground border border-border"
                }`}
              >
                <filter.icon className="w-3.5 h-3.5" />
                <span>{isActive ? value : filter.label}</span>
                {isActive && (
                  <span
                    onClick={(e) => { e.stopPropagation(); clearFilter(filter.key); }}
                    className="mr-0.5"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications List */}
      <div className="p-5">
        {filtered.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-8 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">
              {search || Object.keys(filters).length > 0 ? "لا توجد نتائج" : "لا توجد طلبات بعد"}
            </p>
            {search || Object.keys(filters).length > 0 ? (
              <p className="text-xs text-muted-foreground mt-1">جرّب تعديل البحث أو الفلاتر</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">شارك رابط الشقة لاستقبال الطلبات</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(app => (
              <Link
                key={app.id}
                to={`/apartments/${id}/applicant/${app.id}`}
                className="block bg-surface rounded-xl border border-border p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{app.full_name}</h3>
                  <StatusBadge status={app.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{app.university || "—"}</span>
                  {app.move_in_date && (
                    <span>بداية السكن: {moment(app.move_in_date).format("D MMM")}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Filter Sheets */}
      <FilterSheet
        open={openSheet === "university"}
        onOpenChange={(o) => !o && setOpenSheet(null)}
        title="اختر الجامعة"
        options={options.university}
        selected={filters.university}
        onSelect={(v) => setFilter("university", v)}
      />
      <FilterSheet
        open={openSheet === "faculty"}
        onOpenChange={(o) => !o && setOpenSheet(null)}
        title="اختر الكلية"
        options={options.faculty}
        selected={filters.faculty}
        onSelect={(v) => setFilter("faculty", v)}
      />
      <FilterSheet
        open={openSheet === "governorate"}
        onOpenChange={(o) => !o && setOpenSheet(null)}
        title="اختر المحافظة"
        options={options.governorate}
        selected={filters.governorate}
        onSelect={(v) => setFilter("governorate", v)}
      />
      <FilterSheet
        open={openSheet === "applying_as"}
        onOpenChange={(o) => !o && setOpenSheet(null)}
        title="فرد أم مجموعة"
        options={options.applying_as}
        selected={filters.applying_as}
        onSelect={(v) => setFilter("applying_as", v)}
      />

      {/* Move-in Date Sheet */}
      <Sheet open={openSheet === "move_in_date"} onOpenChange={(o) => !o && setOpenSheet(null)}>
        <SheetContent side="bottom" dir="rtl" className="rounded-t-3xl px-5 pb-6 pt-3">
          <SheetHeader>
            <SheetTitle className="text-center">اختر تاريخ السكن</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-1 max-h-[50vh] overflow-y-auto">
            {moveInDates.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">لا توجد تواريخ</p>
            ) : (
              moveInDates.map(date => (
                <button
                  key={date}
                  onClick={() => { setFilter("move_in_date", date); setOpenSheet(null); }}
                  className={`w-full text-right p-3 rounded-lg text-sm ${filters.move_in_date === date ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                >
                  {moment(date).format("D MMMM YYYY")}
                </button>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}