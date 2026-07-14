import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { GripVertical, Plus, Trash2, Lock } from "lucide-react";
import { DEFAULT_FORM_FIELDS, FIELD_TYPES } from "@/lib/constants";

export default function FormBuilderSheet({ open, onOpenChange, apartmentId }) {
  const { toast } = useToast();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newField, setNewField] = useState({ label: "", type: "short_text", required: false, options: "" });

  useEffect(() => {
    if (open && apartmentId) {
      setLoading(true);
      base44.entities.Apartment.get(apartmentId).then(apt => {
        const parsed = apt.custom_form_fields ? JSON.parse(apt.custom_form_fields) : DEFAULT_FORM_FIELDS;
        setFields(parsed);
        setLoading(false);
      });
    }
  }, [open, apartmentId]);

  function onDragEnd(result) {
    if (!result.destination) return;
    const items = Array.from(fields);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setFields(items);
  }

  function handleAddField() {
    if (!newField.label.trim()) return;
    const field = {
      id: "custom_" + Date.now(),
      label: newField.label,
      type: newField.type,
      required: newField.required,
      section: "custom",
      options: ["dropdown", "radio", "multi_select"].includes(newField.type)
        ? newField.options.split("\n").map(o => o.trim()).filter(Boolean)
        : undefined
    };
    setFields(prev => [...prev, field]);
    setNewField({ label: "", type: "short_text", required: false, options: "" });
    setShowAdd(false);
  }

  function removeField(fieldId) {
    setFields(prev => prev.filter(f => f.id !== fieldId));
  }

  function toggleRequired(fieldId) {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, required: !f.required } : f));
  }

  function updateLabel(fieldId, label) {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, label } : f));
  }

  async function handleSave() {
    setSaving(true);
    await base44.entities.Apartment.update(apartmentId, { custom_form_fields: JSON.stringify(fields) });
    setSaving(false);
    toast({ title: "✓ تم حفظ النموذج" });
    onOpenChange(false);
  }

  const needsOptions = ["dropdown", "radio", "multi_select"].includes(newField.type);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" dir="rtl" className="rounded-t-2xl max-h-[90vh] overflow-y-auto px-5 pb-6 pt-3">
          <SheetHeader>
            <SheetTitle className="text-center">تخصيص نموذج التقديم</SheetTitle>
          </SheetHeader>

          {loading ? (
            <div className="py-8 text-center text-gray-400 text-sm">جاري التحميل...</div>
          ) : (
            <div className="py-4">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="fields">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {fields.map((field, index) => (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-2 p-3 rounded-xl border ${snapshot.isDragging ? "shadow-lg bg-white" : "bg-gray-50 border-gray-200"}`}
                            >
                              <span {...provided.dragHandleProps} className="cursor-grab text-gray-400">
                                <GripVertical className="w-4 h-4" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <Input
                                  value={field.label}
                                  onChange={e => updateLabel(field.id, e.target.value)}
                                  className="border-0 bg-transparent p-0 h-auto text-sm font-medium focus-visible:ring-0"
                                  disabled={field.locked}
                                />
                                <span className="text-[10px] text-gray-400">
                                  {FIELD_TYPES.find(t => t.value === field.type)?.label}
                                </span>
                              </div>
                              {field.locked ? (
                                <Lock className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Switch checked={field.required} onCheckedChange={() => toggleRequired(field.id)} />
                                  <button onClick={() => removeField(field.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Button variant="outline" className="w-full mt-3 gap-1.5" onClick={() => setShowAdd(true)}>
                <Plus className="w-4 h-4" />
                إضافة حقل
              </Button>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave} disabled={saving} className="flex-1 h-12">
                  {saving ? "جاري الحفظ..." : "حفظ النموذج"}
                </Button>
                <Button variant="outline" onClick={() => { setFields(DEFAULT_FORM_FIELDS); toast({ title: "تم إعادة الضبط" }); }}>
                  إعادة الضبط
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة حقل</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>اسم الحقل</Label>
              <Input value={newField.label} onChange={e => setNewField(p => ({ ...p, label: e.target.value }))} className="mt-1.5 h-12" />
            </div>
            <div>
              <Label>النوع</Label>
              <Select value={newField.type} onValueChange={v => setNewField(p => ({ ...p, type: v }))}>
                <SelectTrigger className="mt-1.5 h-12"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {needsOptions && (
              <div>
                <Label>الخيارات (سطر لكل خيار)</Label>
                <textarea
                  value={newField.options}
                  onChange={e => setNewField(p => ({ ...p, options: e.target.value }))}
                  className="mt-1.5 w-full rounded-md border border-input px-3 py-2 text-sm min-h-[80px]"
                  placeholder={"خيار 1\nخيار 2"}
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch checked={newField.required} onCheckedChange={v => setNewField(p => ({ ...p, required: v }))} />
              <Label>إجباري</Label>
            </div>
          </div>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={handleAddField}>إضافة</Button>
            <Button variant="outline" onClick={() => setShowAdd(false)}>إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}