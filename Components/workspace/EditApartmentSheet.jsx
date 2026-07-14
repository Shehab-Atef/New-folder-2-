import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { GENDER_TYPES, APARTMENT_STATUSES } from "@/lib/constants";

export default function EditApartmentSheet({ open, onOpenChange, apartment, onUpdated }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (apartment && open) {
      setForm({
        title: apartment.title,
        description: apartment.description,
        rent: apartment.rent,
        location: apartment.location,
        rooms: apartment.rooms,
        available_date: apartment.available_date,
        gender_type: apartment.gender_type,
        status: apartment.status
      });
    }
  }, [apartment, open]);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Apartment.update(apartment.id, {
        ...form,
        rent: Number(form.rent),
        rooms: Number(form.rooms)
      });
      toast({ title: "✓ تم تحديث الشقة" });
      onOpenChange(false);
      onUpdated();
    } catch (e) {
      toast({ title: "حدث خطأ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" dir="rtl" className="rounded-t-2xl max-h-[90vh] overflow-y-auto px-5 pb-6 pt-3">
        <SheetHeader>
          <SheetTitle className="text-center">تعديل الشقة</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label>عنوان الشقة</Label>
            <Input value={form.title || ""} onChange={e => handleChange("title", e.target.value)} required className="mt-1.5 h-12" />
          </div>
          <div>
            <Label>الوصف</Label>
            <Textarea value={form.description || ""} onChange={e => handleChange("description", e.target.value)} required className="mt-1.5" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>الإيجار</Label>
              <Input type="number" value={form.rent || ""} onChange={e => handleChange("rent", e.target.value)} required className="mt-1.5 h-12" />
            </div>
            <div>
              <Label>الغرف</Label>
              <Input type="number" value={form.rooms || ""} onChange={e => handleChange("rooms", e.target.value)} required className="mt-1.5 h-12" />
            </div>
          </div>
          <div>
            <Label>الموقع</Label>
            <Input value={form.location || ""} onChange={e => handleChange("location", e.target.value)} required className="mt-1.5 h-12" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>تاريخ التوفر</Label>
              <Input type="date" value={form.available_date || ""} onChange={e => handleChange("available_date", e.target.value)} required className="mt-1.5 h-12" />
            </div>
            <div>
              <Label>نوع السكن</Label>
              <Select value={form.gender_type || ""} onValueChange={v => handleChange("gender_type", v)}>
                <SelectTrigger className="mt-1.5 h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GENDER_TYPES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>الحالة</Label>
            <Select value={form.status || ""} onValueChange={v => handleChange("status", v)}>
              <SelectTrigger className="mt-1.5 h-12"><SelectValue /></SelectTrigger>
              <SelectContent>
                {APARTMENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={saving} className="w-full h-12">
            {saving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}