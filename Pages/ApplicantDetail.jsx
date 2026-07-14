import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import StatusBadge from "@/components/StatusBadge";
import TimelineNotes from "@/components/workspace/TimelineNotes";
import { ALL_STATUSES, STATUS_CONFIG } from "@/lib/constants";
import {
  ArrowRight, Phone, Copy, Mail, MessageSquare, User, GraduationCap, Home
} from "lucide-react";
import moment from "moment";

export default function ApplicantDetail() {
  const { id, appId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [app, setApp] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [appId]);

  async function loadData() {
    try {
      const [application, appNotes] = await Promise.all([
        base44.entities.Application.get(appId),
        base44.entities.ApplicationNote.filter({ application_id: appId }, "-created_date")
      ]);
      setApp(application);
      setNotes(appNotes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status) {
    await base44.entities.Application.update(appId, { status });
    setApp(prev => ({ ...prev, status }));
    toast({ title: "✓ تم تغيير الحالة" });
  }

  function copyText(text, label) {
    navigator.clipboard.writeText(text);
    toast({ title: `✓ تم نسخ ${label}` });
  }

  function formatPhoneForWhatsApp(phone) {
    let cleaned = (phone || "").replace(/[\s\-+]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "20" + cleaned.slice(1);
    }
    return cleaned;
  }

  if (loading) {
    return (
      <div className="p-5 space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!app) {
    return <div className="p-5 text-center text-muted-foreground">الطلب غير موجود</div>;
  }

  const customFields = app.custom_fields ? JSON.parse(app.custom_fields) : {};
  const emailValue = Object.values(customFields).find(f => f.label?.includes("بريد") || f.label?.includes("email"))?.value;
  const whatsappPhone = formatPhoneForWhatsApp(app.phone);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-popover/95 backdrop-blur border-b border-border">
        <div className="px-5 py-3 flex items-center justify-between">
          <button onClick={() => navigate(`/apartments/${id}/applications`)} className="text-muted-foreground hover:text-foreground">
            <ArrowRight className="w-5 h-5" />
          </button>
          <h1 className="font-semibold text-sm">{app.full_name}</h1>
          <StatusBadge status={app.status} />
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          <a
            href={`tel:${app.phone}`}
            className="flex flex-col items-center gap-1 p-3 bg-success/10 rounded-lg text-success active:scale-95 transition-transform"
          >
            <Phone className="w-5 h-5" />
            <span className="text-[10px] font-medium">اتصال</span>
          </a>
          <a
            href={`https://wa.me/${whatsappPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 p-3 bg-success/10 rounded-lg text-success active:scale-95 transition-transform"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">واتساب</span>
          </a>
          <button
            onClick={() => copyText(app.phone, "رقم الهاتف")}
            className="flex flex-col items-center gap-1 p-3 bg-surface rounded-lg text-foreground active:scale-95 transition-transform"
          >
            <Copy className="w-5 h-5" />
            <span className="text-[10px] font-medium">نسخ الهاتف</span>
          </button>
          {emailValue && (
            <button
              onClick={() => copyText(emailValue, "البريد")}
              className="flex flex-col items-center gap-1 p-3 bg-surface rounded-lg text-foreground active:scale-95 transition-transform"
            >
              <Mail className="w-5 h-5" />
              <span className="text-[10px] font-medium">نسخ البريد</span>
            </button>
          )}
        </div>

        {/* Status change */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <h2 className="font-semibold text-sm mb-3">تغيير الحالة</h2>
          <div className="grid grid-cols-2 gap-2">
            {ALL_STATUSES.map(status => (
              <button
                key={status}
                onClick={() => updateStatus(status)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors text-right ${
                  app.status === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-muted"
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CONFIG[status]?.dot}`} />
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <h2 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <User className="w-4 h-4" /> البيانات الشخصية
          </h2>
          <div className="space-y-1.5 text-sm">
            {app.gender && <div className="flex justify-between"><span className="text-muted-foreground">النوع</span><span>{app.gender}</span></div>}
            {app.governorate && <div className="flex justify-between"><span className="text-muted-foreground">المحافظة</span><span>{app.governorate}</span></div>}
          </div>
        </div>

        {/* Academic Info */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <h2 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" /> البيانات الدراسية
          </h2>
          <div className="space-y-1.5 text-sm">
            {app.university && <div className="flex justify-between"><span className="text-muted-foreground">الجامعة</span><span className="text-left">{app.university}</span></div>}
            {app.faculty && <div className="flex justify-between"><span className="text-muted-foreground">الكلية</span><span>{app.faculty}</span></div>}
            {app.study_year && <div className="flex justify-between"><span className="text-muted-foreground">السنة</span><span>{app.study_year}</span></div>}
          </div>
        </div>

        {/* Housing Info */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <h2 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Home className="w-4 h-4" /> بيانات السكن
          </h2>
          <div className="space-y-1.5 text-sm">
            {app.applying_as && <div className="flex justify-between"><span className="text-muted-foreground">التقديم</span><span>{app.applying_as}</span></div>}
            {app.applying_as === "مجموعة" && app.group_size && <div className="flex justify-between"><span className="text-muted-foreground">عدد الأفراد</span><span>{app.group_size}</span></div>}
            {app.move_in_date && <div className="flex justify-between"><span className="text-muted-foreground">بداية السكن</span><span>{moment(app.move_in_date).format("D/M/YYYY")}</span></div>}
            {app.expected_stay && <div className="flex justify-between"><span className="text-muted-foreground">مدة الإقامة</span><span>{app.expected_stay}</span></div>}
          </div>
        </div>

        {/* Student Notes */}
        {app.notes_text && (
          <div className="bg-surface rounded-xl border border-border p-4">
            <h2 className="font-semibold text-sm mb-2">ملاحظات الطالب</h2>
            <p className="text-sm text-foreground">{app.notes_text}</p>
          </div>
        )}

        {/* Custom Fields */}
        {Object.keys(customFields).length > 0 && (
          <div className="bg-surface rounded-xl border border-border p-4">
            <h2 className="font-semibold text-sm mb-2">أسئلة إضافية</h2>
            <div className="space-y-1.5 text-sm">
              {Object.entries(customFields).map(([key, field]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground">{field.label}</span>
                  <span className="text-left">{Array.isArray(field.value) ? field.value.join("، ") : String(field.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline Notes */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <h2 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> ملاحظات
          </h2>
          <TimelineNotes applicationId={appId} notes={notes} onUpdated={loadData} />
        </div>
      </div>
    </div>
  );
}