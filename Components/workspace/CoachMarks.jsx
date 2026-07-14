import React, { useState, useEffect } from "react";
import { Link2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "sr_coachmarks_dismissed";

export default function CoachMarks() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const timer = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  const marks = [
    { icon: Link2, title: "📋 انسخ الرابط", desc: "اضغط على \"نسخ الرابط\" في الأعلى وشاركه مع الطلاب" },
    { icon: Users, title: "👥 الطلبات تظهر هنا", desc: "ستظهر طلبات الطلاب تلقائياً في هذا القسم" }
  ];
  const mark = marks[index];
  const isLast = index === marks.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6" onClick={dismiss}>
      <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={dismiss} className="absolute top-3 left-3 text-gray-400 hover:text-gray-700">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3 mb-4 mt-1">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <mark.icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm">{mark.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{mark.desc}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 items-center">
            {marks.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-primary" : "w-1.5 bg-gray-300"}`} />
            ))}
          </div>
          <Button size="sm" onClick={() => isLast ? dismiss() : setIndex(1)} className="h-8 px-4 text-xs">
            {isLast ? "تم" : "التالي"}
          </Button>
        </div>
      </div>
    </div>
  );
}