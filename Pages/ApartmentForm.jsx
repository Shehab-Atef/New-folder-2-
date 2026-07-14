import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight } from "lucide-react";
import { generateSlug, GENDER_TYPES, DEFAULT_FORM_FIELDS } from "@/lib/constants";

export default function ApartmentForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", rent: "", location: "", rooms: "", available_date: "", gender_type: ""
  });

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.rent || !form.location || !form.rooms || !form.available_date || !form.gender_type) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const apt = await base44.entities.Apartment.create({
        ...form,
        rent: Number(form.rent),
        rooms: Number(form.rooms),
        status: "متاحة",
        slug: generateSlug(),
        is_deleted: false,
        custom_form_fields: JSON.stringify(DEFAULT_FORM_FIELDS)
      });
      toast({ title: "✓ تم إنشاء الشقة" });
      navigate(`/apartments/${apt.id}`);
    } catch (e) {
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-5 pb-32">
      <button onClick={() => navigate("/apartments")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowRight className="w-4 h-4" />
        العودة
      </button>

      <h1 className="text-xl font-bold mb-6">شقة جديدة</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label>عنوان الشقة *</Label>
          <Input
            value={form.title}
            onChange={e => handleChange("title", e.target.value)}
            placeholder="مثال: شقة طلابية في المعادي"
            className="mt-1.5 h-12"
          />
        </div>
        <div>
          <Label>الوصف</Label>
          <Textarea
            value={form.description}
            onChange={e => handleChange("description", e.target.value)}
            placeholder="تفاصيل الشقة..."
            className="mt-1.5"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>الإيجار (ج.م) *</Label>
            <Input type="number" value={form.rent} onChange={e => handleChange("rent", e.target.value)} className="mt-1.5 h-12" />
          </div>
          <div>
            <Label>الغرف *</Label>
            <Input type="number" value={form.rooms} onChange={e => handleChange("rooms", e.target.value)} className="mt-1.5 h-12" />
          </div>
        </div>
        <div>
          <Label>الموقع *</Label>
          <Input value={form.location} onChange={e => handleChange("location", e.target.value)} placeholder="المدينة - الحي" className="mt-1.5 h-12" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>تاريخ التوفر *</Label>
            <Input type="date" value={form.available_date} onChange={e => handleChange("available_date", e.target.value)} className="mt-1.5 h-12" />
          </div>
          <div>
            <Label>نوع السكن *</Label>
            <Select value={form.gender_type} onValueChange={v => handleChange("gender_type", v)}>
              <SelectTrigger className="mt-1.5 h-12"><SelectValue placeholder="اختر" /></SelectTrigger>
              <SelectContent>
                {GENDER_TYPES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>

      {/* Fixed bottom submit */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-5 z-40">
        <Button onClick={handleSubmit} disabled={saving} className="w-full h-12">
          {saving ? "جاري الحفظ..." : "إنشاء الشقة"}
        </Button>
      </div>
    </div>
  );
}