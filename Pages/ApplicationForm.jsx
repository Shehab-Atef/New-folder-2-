import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, CheckCircle2 } from "lucide-react";
import { GOVERNORATES, UNIVERSITIES, DEFAULT_FORM_FIELDS } from "@/lib/constants";

function SearchableSelect({ options, value, onChange, placeholder }) {
  const [search, setSearch] = useState("");
  const filtered = options.filter(o => o.includes(search));

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12"><SelectValue placeholder={placeholder || "اختر"} /></SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input
            placeholder="بحث..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 text-sm"
            onClick={e => e.stopPropagation()}
          />
        </div>
        {filtered.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export default function ApplicationForm() {
  const { slug } = useParams();
  const [apartment, setApartment] = useState(null);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const results = await base44.entities.Apartment.filter({ slug, is_deleted: false });
        if (results.length === 0) {
          setNotFound(true);
        } else {
          const apt = results[0];
          setApartment(apt);
          const parsed = apt.custom_form_fields ? JSON.parse(apt.custom_form_fields) : DEFAULT_FORM_FIELDS;
          setFields(parsed);
        }
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  function handleChange(fieldId, value) {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  }

  function shouldShow(field) {
    if (!field.showWhen) return true;
    return formData[field.showWhen.field] === field.showWhen.value;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const standardFields = ["full_name", "phone", "governorate", "gender", "university", "faculty", "study_year", "applying_as", "group_size", "move_in_date", "expected_stay", "notes_text"];

    const appData = {
      apartment_id: apartment.id,
      apartment_owner_id: apartment.created_by_id,
      status: "جديد"
    };

    const customData = {};

    for (const [key, val] of Object.entries(formData)) {
      if (standardFields.includes(key)) {
        if (key === "group_size") {
          appData[key] = Number(val);
        } else {
          appData[key] = val;
        }
      } else {
        const fieldDef = fields.find(f => f.id === key);
        customData[key] = { label: fieldDef?.label || key, value: val };
      }
    }

    if (Object.keys(customData).length > 0) {
      appData.custom_fields = JSON.stringify(customData);
    }

    try {
      await base44.entities.Application.create(appData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function renderField(field) {
    if (!shouldShow(field)) return null;
    const val = formData[field.id] || "";

    let options = field.options || [];
    if (field.useGovernorateList) options = GOVERNORATES;
    if (field.useUniversityList) options = UNIVERSITIES;

    switch (field.type) {
      case "short_text":
      case "phone":
      case "email":
        return <Input type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"} value={val} onChange={e => handleChange(field.id, e.target.value)} required={field.required} className="h-12" />;
      case "long_text":
        return <Textarea value={val} onChange={e => handleChange(field.id, e.target.value)} required={field.required} rows={3} />;
      case "number":
        return <Input type="number" value={val} onChange={e => handleChange(field.id, e.target.value)} required={field.required} className="h-12" />;
      case "date":
        return <Input type="date" value={val} onChange={e => handleChange(field.id, e.target.value)} required={field.required} className="h-12" />;
      case "dropdown":
        if (field.useUniversityList || field.useGovernorateList) {
          return <SearchableSelect options={options} value={val} onChange={v => handleChange(field.id, v)} />;
        }
        return (
          <Select value={val} onValueChange={v => handleChange(field.id, v)}>
            <SelectTrigger className="h-12"><SelectValue placeholder="اختر" /></SelectTrigger>
            <SelectContent>
              {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        );
      case "radio":
        return (
          <RadioGroup value={val} onValueChange={v => handleChange(field.id, v)} className="flex flex-wrap gap-4 pt-2">
            {options.map(o => (
              <div key={o} className="flex items-center gap-2">
                <RadioGroupItem value={o} id={`${field.id}-${o}`} />
                <Label htmlFor={`${field.id}-${o}`} className="font-normal">{o}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "checkbox":
        return (
          <div className="flex items-center gap-2 pt-2">
            <Checkbox checked={!!val} onCheckedChange={v => handleChange(field.id, v)} />
            <span className="text-sm">نعم</span>
          </div>
        );
      case "multi_select":
        const selected = val ? (Array.isArray(val) ? val : []) : [];
        return (
          <div className="flex flex-wrap gap-2 pt-1">
            {options.map(o => (
              <label key={o} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${selected.includes(o) ? "bg-primary/10 border-primary" : "bg-white border-gray-200"}`}>
                <Checkbox checked={selected.includes(o)} onCheckedChange={checked => {
                  handleChange(field.id, checked ? [...selected, o] : selected.filter(s => s !== o));
                }} />
                {o}
              </label>
            ))}
          </div>
        );
      case "file":
        return (
          <Input type="file" onChange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              const { file_url } = await base44.integrations.Core.UploadFile({ file });
              handleChange(field.id, file_url);
            }
          }} className="h-12" />
        );
      default:
        return <Input value={val} onChange={e => handleChange(field.id, e.target.value)} className="h-12" />;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-700 mb-2">الشقة غير موجودة</h1>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">تم إرسال طلبك بنجاح</h1>
          <p className="text-gray-500 text-sm">سيقوم صاحب الشقة بالتواصل معك في حالة اختيار طلبك.</p>
        </div>
      </div>
    );
  }

  const sections = [
    { key: "personal", title: "البيانات الشخصية" },
    { key: "academic", title: "البيانات الدراسية" },
    { key: "housing", title: "بيانات السكن" },
    { key: "extra", title: "معلومات إضافية" },
    { key: "custom", title: "حقول إضافية" },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-[480px] mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">التقديم على {apartment.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{apartment.location}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {sections.map(section => {
            const sectionFields = fields.filter(f => f.section === section.key && shouldShow(f));
            if (sectionFields.length === 0) return null;
            return (
              <div key={section.key} className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-semibold text-sm text-gray-800 mb-4 pb-2 border-b border-gray-100">{section.title}</h2>
                <div className="space-y-5">
                  {sectionFields.map(field => (
                    <div key={field.id}>
                      <Label className="text-sm">
                        {field.label}
                        {field.required && <span className="text-red-500 mr-1">*</span>}
                      </Label>
                      <div className="mt-1.5">
                        {renderField(field)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <Button type="submit" className="w-full h-14 rounded-xl text-base" disabled={submitting}>
            {submitting ? "جاري الإرسال..." : "إرسال الطلب"}
          </Button>
        </form>
      </div>
    </div>
  );
}