import React from "react";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft } from "lucide-react";

export default function WelcomeStep({ onNext }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6">
        <Building2 className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold mb-3">مرحباً 👋</h1>
      <p className="text-gray-500 text-sm mb-10 leading-relaxed">
        لنبدأ بنشر شقتك الأولى واستقبال طلبات الطلاب
      </p>
      <Button onClick={onNext} className="w-full h-14 text-base gap-2">
        ابدأ الآن
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <p className="text-xs text-gray-400 mt-4">أقل من دقيقة</p>
    </div>
  );
}