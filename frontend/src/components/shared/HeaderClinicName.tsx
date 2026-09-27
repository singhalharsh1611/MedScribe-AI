
"use client";
import { useState, useEffect } from "react";
import { getUser, api } from "@/lib/api";

export default function HeaderClinicName({ defaultText = "MedScribe AI Clinic" }: { defaultText?: string }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (user && user.clinic_id) {
      api.clinics.get(user.clinic_id).then(res => {
        if (res?.clinic?.name) {
          setName(res.clinic.name);
        }
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="h-4 w-48 bg-text-muted/20 rounded animate-pulse inline-block align-middle"></div>;
  }

  return <>{name || defaultText}</>;
}

