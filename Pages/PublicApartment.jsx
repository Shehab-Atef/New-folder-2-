import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, MapPin, BedDouble, Calendar, Users, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import moment from "moment";

export default function PublicApartment() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const results = await base44.entities.Apartment.filter({ slug, is_deleted: false });
        if (results.length === 0) {
          setNotFound(true);
        } else {
          setApartment(results[0]);
        }
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

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
          <p className="text-gray-500 text-sm">تأكد من صحة الرابط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-[480px] mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">{apartment.title}</h1>
          <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            {apartment.location}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <p className="text-gray-700 leading-relaxed mb-6">{apartment.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Banknote className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">الإيجار</p>
              <p className="font-bold">{apartment.rent} ج.م</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <BedDouble className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">الغرف</p>
              <p className="font-bold">{apartment.rooms}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Users className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">نوع السكن</p>
              <p className="font-bold">{apartment.gender_type}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <p className="text-xs text-gray-500">التوفر</p>
              <p className="font-bold">{moment(apartment.available_date).format("D/M/YYYY")}</p>
            </div>
          </div>
        </div>

        {apartment.status === "مؤجرة" ? (
          <div className="text-center p-6 bg-orange-50 rounded-2xl border border-orange-200">
            <p className="text-orange-700 font-medium">هذه الشقة مؤجرة حالياً</p>
          </div>
        ) : (
          <Button
            className="w-full py-6 text-lg gap-2 rounded-xl"
            onClick={() => navigate(`/apply/${slug}/submit`)}
          >
            التقديم على هذه الشقة
          </Button>
        )}
      </div>
    </div>
  );
}