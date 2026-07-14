import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import { FileText, ChevronLeft } from "lucide-react";
import moment from "moment";

export default function RecentApplications({ applications, apartmentId, maxItems = 5 }) {
  const display = applications.slice(0, maxItems);

  if (applications.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6 text-center">
        <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-foreground font-medium mb-1">لا توجد طلبات بعد</p>
        <p className="text-xs text-muted-foreground">شارك رابط الشقة لبدء استقبال الطلبات</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {display.map(app => (
          <Link
            key={app.id}
            to={`/apartments/${apartmentId}/applicant/${app.id}`}
            className="block bg-surface rounded-xl border border-border p-3 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{app.full_name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {app.university || "—"} • {moment(app.created_date).fromNow()}
                </p>
              </div>
              <StatusBadge status={app.status} />
            </div>
          </Link>
        ))}
      </div>
      {applications.length > maxItems && (
        <Link
          to={`/apartments/${apartmentId}/applications`}
          className="w-full flex items-center justify-center gap-1 text-sm text-primary py-3 mt-2 hover:underline"
        >
          عرض كل الطلبات ({applications.length})
          <ChevronLeft className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}