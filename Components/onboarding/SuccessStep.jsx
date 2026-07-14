import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Link2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SuccessStep({ apartment }) {
  const { toast } = useToast();
  const link = `${window.location.origin}/apply/${apartment.slug}`;

  function copyLink() {
    navigator.clipboard.writeText(link);
    toast({ title: "✓ تم نسخ الرابط" });
  }

  function openApartment() {
    window.location.href = `/apartments/${apartment.id}`;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-2xl font-bold mb-2">تم! 🎉</h1>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
        شقتك جاهزة. انسخ الرابط وشاركه مع الطلاب لاستقبال الطلبات.
      </p>

      <div className="w-full bg-white rounded-xl border border-gray-200 p-4 mb-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-600 truncate flex-1 text-right">{link}</p>
        </div>
      </div>

      <Button onClick={copyLink} variant="outline" className="w-full h-12 mb-3 gap-2">
        <Link2 className="w-4 h-4" />
        نسخ الرابط
      </Button>
      <Button onClick={openApartment} className="w-full h-12 gap-2">
        افتح الشقة
        <ArrowLeft className="w-4 h-4" />
      </Button>
    </div>
  );
}