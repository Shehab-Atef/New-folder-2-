import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import StatusBadge from "@/components/StatusBadge";
import RecentApplications from "@/components/workspace/RecentApplications";
import EditApartmentSheet from "@/components/workspace/EditApartmentSheet";
import FormBuilderSheet from "@/components/workspace/FormBuilderSheet";
import CoachMarks from "@/components/workspace/CoachMarks";
import {
  ArrowRight, Link2, Pencil, Sliders, Trash2,
  Banknote, BedDouble, Users, Calendar, FileText, ChevronLeft
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import moment from "moment";

export default function ApartmentWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apartment, setApartment] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [formBuilderOpen, setFormBuilderOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
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

  async function handleDelete() {
    await base44.entities.Apartment.update(id, { is_deleted: true });
    toast({ title: "✓ تم حذف الشقة" });
    navigate("/");
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/apply/${apartment.slug}`);
    toast({ title: "✓ تم نسخ الرابط" });
  }

  if (loading) {
    return (
      <div className="p-5 space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (!apartment) {
    return <div className="p-5 text-center text-muted-foreground">الشقة غير موجودة</div>;
  }

  const stats = {
    total: applications.length,
    new: applications.filter(a => a.status === "جديد").length,
    accepted: applications.filter(a => a.status === "تم القبول").length,
    waiting: applications.filter(a => a.status === "قائمة الانتظار").length,
    rejected: applications.filter(a => a.status === "تم الرفض").length
  };

  const formFields = apartment.custom_form_fields ? JSON.parse(apartment.custom_form_fields) : [];

  return (
    <div className="pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-popover/95 backdrop-blur-sm border-b border-border">
        <div className="px-5 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center px-2">
              <h1 className="font-semibold text-sm truncate">{apartment.title}</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">{apartment.location} • {apartment.rent} ج.م</p>
            </div>
            <StatusBadge status={apartment.status} />
          </div>
        </div>
        {/* Quick Actions */}
        <div className="flex items-center gap-1 px-3 pb-2">
          <Button variant="ghost" size="sm" className="flex-1 text-xs gap-1 h-10" onClick={copyLink}>
            <Link2 className="w-3.5 h-3.5" />
            نسخ الرابط
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs gap-1 h-10" onClick={() => setFormBuilderOpen(true)}>
            <Sliders className="w-3.5 h-3.5" />
            النموذج
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 text-xs gap-1 h-10" onClick={() => setEditOpen(true)}>
            <Pencil className="w-3.5 h-3.5" />
            تعديل
          </Button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Overview */}
        <div>
          <h2 className="font-semibold text-sm text-muted-foreground mb-3">نظرة عامة</h2>
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "الكل", value: stats.total, color: "text-foreground" },
              { label: "جديد", value: stats.new, color: "text-info" },
              { label: "مقبول", value: stats.accepted, color: "text-success" },
              { label: "انتظار", value: stats.waiting, color: "text-warning" },
              { label: "مرفوض", value: stats.rejected, color: "text-danger" }
            ].map(stat => (
              <div key={stat.label} className="bg-surface rounded-lg border border-border p-2 text-center">
                <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[9px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Applications Summary */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-muted-foreground">الطلبات</h2>
            <Link to={`/apartments/${id}/applications`} className="text-xs text-primary flex items-center gap-1">
              عرض الكل
              <ChevronLeft className="w-3 h-3" />
            </Link>
          </div>
          <RecentApplications applications={applications} apartmentId={id} maxItems={5} />
        </div>

        {/* Apartment Details */}
        <div>
          <h2 className="font-semibold text-sm text-muted-foreground mb-3">تفاصيل الشقة</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl border border-border p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                <Banknote className="w-3.5 h-3.5" /> الإيجار
              </div>
              <p className="font-bold text-sm">{apartment.rent} ج.م</p>
            </div>
            <div className="bg-surface rounded-xl border border-border p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                <BedDouble className="w-3.5 h-3.5" /> الغرف
              </div>
              <p className="font-bold text-sm">{apartment.rooms}</p>
            </div>
            <div className="bg-surface rounded-xl border border-border p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                <Users className="w-3.5 h-3.5" /> نوع السكن
              </div>
              <p className="font-bold text-sm">{apartment.gender_type}</p>
            </div>
            <div className="bg-surface rounded-xl border border-border p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                <Calendar className="w-3.5 h-3.5" /> التوفر
              </div>
              <p className="font-bold text-sm">{moment(apartment.available_date).format("D/M")}</p>
            </div>
          </div>
          {apartment.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">{apartment.description}</p>
          )}
        </div>

        {/* Settings */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full text-danger hover:text-danger hover:bg-danger/10 gap-2"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
            حذف الشقة
          </Button>
        </div>
      </div>

      {/* Sheets */}
      <EditApartmentSheet open={editOpen} onOpenChange={setEditOpen} apartment={apartment} onUpdated={loadData} />
      <FormBuilderSheet open={formBuilderOpen} onOpenChange={setFormBuilderOpen} apartmentId={id} />
      <CoachMarks />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الشقة؟</AlertDialogTitle>
            <AlertDialogDescription>لن تتمكن من استرجاع الشقة بعد الحذف.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-danger hover:bg-danger/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}