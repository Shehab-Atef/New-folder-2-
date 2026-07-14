import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowRight, Loader2 } from "lucide-react";
import { generateSlug, DEFAULT_FORM_FIELDS } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";

export default function OtpStep({ ownerData, apartmentData, onSuccess, onBack }) {
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: ownerData.email, otpCode: otp });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      const apt = await base44.entities.Apartment.create({
        title: apartmentData.title,
        description: "",
        rent: apartmentData.rent,
        location: apartmentData.location,
        rooms: apartmentData.rooms,
        available_date: apartmentData.available_date,
        gender_type: apartmentData.gender_type,
        status: "متاحة",
        slug: generateSlug(),
        is_deleted: false,
        custom_form_fields: JSON.stringify(DEFAULT_FORM_FIELDS)
      });
      await base44.auth.updateMe({ full_name: ownerData.full_name });
      onSuccess(apt);
    } catch (err) {
      setError(err.message || "رمز غير صحيح");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await base44.auth.resendOtp(ownerData.email);
      toast({ title: "تم إرسال رمز جديد" });
    } catch (e) {
      setError("فشل إعادة الإرسال");
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-5 pt-16 pb-8">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <ArrowRight className="w-4 h-4" />
        رجوع
      </button>
      <h1 className="text-xl font-bold mb-1">تأكيد البريد</h1>
      <p className="text-sm text-gray-500 mb-6">خطوة 3 من 3</p>

      <div className="flex gap-1.5 mb-8">
        <div className="h-1.5 flex-1 bg-primary rounded-full" />
        <div className="h-1.5 flex-1 bg-primary rounded-full" />
        <div className="h-1.5 flex-1 bg-primary rounded-full" />
      </div>

      <p className="text-sm text-gray-600 text-center mb-6">
        أرسلنا رمزاً إلى<br />
        <span className="font-medium text-gray-800">{ownerData.email}</span>
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex justify-center mb-6">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button onClick={handleVerify} disabled={loading || otp.length < 6} className="w-full h-12">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            جاري التحقق...
          </>
        ) : "تأكيد"}
      </Button>

      <p className="text-center text-sm text-gray-500 mt-4">
        لم يصلك الرمز؟{" "}
        <button onClick={handleResend} className="text-primary font-medium hover:underline">
          إعادة الإرسال
        </button>
      </p>
    </div>
  );
}