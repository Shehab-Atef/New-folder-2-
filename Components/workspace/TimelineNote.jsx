import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import moment from "moment";

function groupNotes(notes) {
  const groups = [];
  const today = [];
  const yesterday = [];
  const thisWeek = [];
  const earlier = [];

  notes.forEach(note => {
    const d = moment(note.created_date);
    if (d.isSame(moment(), 'day')) today.push(note);
    else if (d.isSame(moment().subtract(1, 'day'), 'day')) yesterday.push(note);
    else if (d.isAfter(moment().subtract(7, 'days'))) thisWeek.push(note);
    else earlier.push(note);
  });

  if (today.length) groups.push({ label: "اليوم", notes: today });
  if (yesterday.length) groups.push({ label: "أمس", notes: yesterday });
  if (thisWeek.length) groups.push({ label: "هذا الأسبوع", notes: thisWeek });
  if (earlier.length) groups.push({ label: "سابق", notes: earlier });

  return groups;
}

export default function TimelineNotes({ applicationId, notes, onUpdated }) {
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);
  const groups = groupNotes(notes);

  async function addNote() {
    if (!newNote.trim()) return;
    setAdding(true);
    await base44.entities.ApplicationNote.create({ application_id: applicationId, note: newNote });
    setNewNote("");
    onUpdated();
    setAdding(false);
  }

  return (
    <div>
      <div className="space-y-2 mb-4">
        <Textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          placeholder="أضف ملاحظة..."
          rows={2}
          className="text-sm"
        />
        <Button size="sm" onClick={addNote} disabled={adding || !newNote.trim()} className="w-full gap-1.5 h-10">
          <Send className="w-3.5 h-3.5" />
          {adding ? "جاري..." : "إضافة"}
        </Button>
      </div>

      {groups.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">لا توجد ملاحظات</p>
      ) : (
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-gray-400 mb-2">{group.label}</p>
              <div className="space-y-2 border-r-2 border-gray-100 pr-3 mr-1">
                {group.notes.map(note => (
                  <div key={note.id} className="relative">
                    <div className="absolute -right-[18px] top-3 w-2 h-2 rounded-full bg-primary" />
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{note.note}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {moment(note.created_date).format("D MMM، h:mm A")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}