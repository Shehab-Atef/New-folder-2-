import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";

export default function Apartments() {
  const [apartments, setApartments] = useState([]);
  const [appsCounts, setAppsCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [apts, apps] = await Promise.all([
          base44.entities.Apartment.filter({ is_deleted: false }, "-created_date"),
          base44.entities.Application.list("-created_date", 500)
        ]);
        const counts = {};
        apps.forEach(a => { counts[a.apartment_id] = (counts[a.apartment_id] || 0) + 1; });
        setApartments(apts);
        setAppsCounts(counts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = apartments.filter(a =>
    a.title.includes(search) || a.location.includes(search)
  );

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">الشقق</h1>
        <Link to="/apartments/new">
          <Button size="icon" className="rounded-full">
            <Plus className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="بحث عن شقة..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pr-10 h-11 rounded-xl"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">{search ? "لا نتائج" : "لا توجد شقق"}</h3>
          {!search && <p className="text-sm text-gray-400 mb-4">انشر شقتك الأولى وابدأ باستقبال الطلبات</p>}
          {!search && (
            <Link to="/apartments/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                نشر شقة
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(apt => (
            <Link
              key={apt.id}
              to={`/apartments/${apt.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all active:scale-[0.98]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{apt.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{apt.location}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${apt.status === "متاحة" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {apt.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary">{apt.rent} ج.م</span>
                <span className="text-gray-500">{appsCounts[apt.id] || 0} طلب</span>
                <span className="text-gray-400">{moment(apt.available_date).format("D MMM")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}