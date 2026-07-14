import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Bell, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import moment from "moment";

export default function Notifications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [aptMap, setAptMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const apps = await base44.entities.Application.filter({ status: "جديد" }, "-created_date", 50);
      const aptIds = [...new Set(apps.map(a => a.apartment_id))];
      const apts = await Promise.all(aptIds.map(id => base44.entities.Apartment.get(id).catch(() => null)));
      const map = {};
      apts.filter(Boolean).forEach(a => { map[a.id] = a; });
      setAptMap(map);
      setApplications(apps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function dismissNotification(appId) {
    setApplications(prev => prev.filter(a => a.id !== appId));
    try {
      await base44.entities.Application.update(appId, { status: "تمت المراجعة" });
    } catch (e) {
      console.error(e);
    }
  }

  async function openNotification(app) {
    await base44.entities.Application.update(app.id, { status: "تمت المراجعة" }).catch(() => {});
    navigate(`/apartments/${app.apartment_id}/applicant/${app.id}`);
  }

  return (
    <div className="p-5 space-y-5">
      <h1 className="text-2xl font-bold font-heading">الإشعارات</h1>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-foreground font-medium mb-1">لا توجد إشعارات</p>
          <p className="text-xs text-muted-foreground">ستظهر الطلبات الجديدة هنا</p>
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map(app => (
            <div
              key={app.id}
              className="flex items-center gap-3 bg-surface rounded-xl border border-border p-4 active:scale-[0.98] transition-transform"
            >
              <button onClick={() => openNotification(app)} className="flex items-start gap-3 flex-1 min-w-0 text-right">
                <div className="w-10 h-10 bg-info/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-info" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">طلب جديد من {app.full_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {aptMap[app.apartment_id]?.title || "—"} • {moment(app.created_date).fromNow()}
                  </p>
                </div>
              </button>
              <button
                onClick={() => dismissNotification(app.id)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}