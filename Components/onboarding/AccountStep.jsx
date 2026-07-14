import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";

export default function AccountStep({ data, setData, onNext, onBack }) {
  const [form, setForm] = useState({
    full_name: data.full_name || "",
    email: data.email || "",
    password: data.password || ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.register({ email: form.email, password: form.password });
      setData(form);
      onNext();
    } catch (err) {
      setError(err.message || "حدث خطأ، تأكد من صحة البريد الإلكتروني");
    } finally {
      setLoading(false);
    }
  }

  const isValid = form.full_name && form.email && form.password.length >= 6;

  return (
    <form onSubmit={handleSubmit} className="min-h-screen flex flex-col px-5 pt-16 pb-8">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <ArrowRight className="w-4 h-4" />
        رجوع
      </button>
      <h1 className="text-xl font-bold mb-1">بياناتك</h1>
      <p className="text-sm text-gray-500 mb-6">خطوة 2 من 3</p>

      <div className="flex gap-1.5 mb-8">
        <div className="h-1.5 flex-1 bg-primary rounded-full" />
        <div className="h-1.5 flex-1 bg-primary rounded-full" />
        <div className="h-1.5 flex-1 bg-gray-200 rounded-full" />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-5 flex-1">
        <div>
          <Label>الاسم *</Label>
          <Input value={form.full_name} onChange={e => handleChange("full_name", e.target.value)} placeholder="اسمك بالكامل" className="mt-1.5 h-12" />
        </div>
        <div>
          <Label>البريد الإلكتروني *</Label>
          <Input type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} placeholder="you@example.com" className="mt-1.5 h-12" />
        </div>
        <div>
          <Label>كلمة المرور *</Label>
          <Input type="password" value={form.password} onChange={e => handleChange("password", e.target.value)} placeholder="6 أحرف على الأقل" className="mt-1.5 h-12" />
          <p className="text-xs text-gray-400 mt-1.5">ستحتاجه لتسجيل الدخول مرة أخرى</p>
        </div>
      </div>

      <Button type="submit" disabled={!isValid || loading} className="w-full h-12 mt-6">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            جاري الإرسال...
          </>
        ) : "متابعة"}
      </Button>
    </form>
  );
}