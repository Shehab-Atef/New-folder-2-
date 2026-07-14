import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight } from "lucide-react";

export default function ApartmentStep({ data, setData, onNext, onBack }) {
  const [form, setForm] = useState({
    title: data.title || "",
    rent: data.rent || "",
    location: data.location || "",
    rooms: data.rooms || "",
    available_date: data.available_date || "",
    gender_type: data.gender_type || ""
  });

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setData({
      ...form,
      rent: Number(form.rent),
      rooms: Number(form.rooms)
    });
    onNext();
  }

  const isValid = form.title && form.rent && form.location && form.rooms && form.available_date && form.gender_type;

  return (
    <form onSubmit={handleSubmit} className="min-h-screen flex flex-col px-5 pt-16 pb-8">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <ArrowRight className="w-4 h-4" />
        رجوع
      </button>
      <h1 className="text-xl font-bold mb-1">معلومات الشقة</h1>
      <p className="text-sm text-gray-500 mb-6">خطوة 1 من 3</p>

      <div className="flex gap-1.5 mb-8">
        <div className="h-1.5 flex-1 bg-primary rounded-full" />
        <div className="h-1.5 flex-1 bg-gray-200 rounded-full" />
        <div className="h-1.5 flex-1 bg-gray-200 rounded-full" />
      </div>

      <div className="space-y-5 flex-1">
        <div>
          <Label>اسم الشقة *</Label>
          <Input value={form.title} onChange={e => handleChange("title", e.target.value)} placeholder="مثال: شقة طلابية في المعادي" className="mt-1.5 h-12" />
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
        <div>
          <Label>تاريخ التوفر *</Label>
          <Input type="date" value={form.available_date} onChange={e => handleChange("available_date", e.target.value)} className="mt-1.5 h-12" />
        </div>
        <div>
          <Label>نوع السكن *</Label>
          <RadioGroup value={form.gender_type} onValueChange={v => handleChange("gender_type", v)} className="flex gap-6 mt-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="شباب" id="boys" />
              <Label htmlFor="boys" className="font-normal cursor-pointer">شباب</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="بنات" id="girls" />
              <Label htmlFor="girls" className="font-normal cursor-pointer">بنات</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Button type="submit" disabled={!isValid} className="w-full h-12 mt-6">
        متابعة
      </Button>
    </form>
  );
}