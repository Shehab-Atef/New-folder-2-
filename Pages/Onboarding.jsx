import React, { useState } from "react";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import ApartmentStep from "@/components/onboarding/ApartmentStep";
import AccountStep from "@/components/onboarding/AccountStep";
import OtpStep from "@/components/onboarding/OtpStep";
import SuccessStep from "@/components/onboarding/SuccessStep";

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [apartmentData, setApartmentData] = useState({});
  const [ownerData, setOwnerData] = useState({});
  const [createdApartment, setCreatedApartment] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-[480px] mx-auto min-h-screen bg-gray-50">
        {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
        {step === 1 && (
          <ApartmentStep
            data={apartmentData}
            setData={setApartmentData}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <AccountStep
            data={ownerData}
            setData={setOwnerData}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <OtpStep
            ownerData={ownerData}
            apartmentData={apartmentData}
            onSuccess={(apt) => { setCreatedApartment(apt); setStep(4); }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && createdApartment && (
          <SuccessStep apartment={createdApartment} />
        )}
      </div>
    </div>
  );
}