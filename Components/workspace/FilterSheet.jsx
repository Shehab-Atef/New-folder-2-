import React, { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Search, Check } from "lucide-react";

export default function FilterSheet({ open, onOpenChange, title, options, selected, onSelect }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return options;
    return options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" dir="rtl" className="rounded-t-3xl max-h-[70vh] flex flex-col px-5 pb-6 pt-3">
        <SheetHeader>
          <SheetTitle className="text-center">{title}</SheetTitle>
        </SheetHeader>
        <div className="relative mt-3 mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.map(opt => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); onOpenChange(false); }}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent text-sm text-right"
            >
              {opt}
              {selected === opt && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">لا نتائج</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}