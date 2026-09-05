"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Import all step components
import StepDetails from "./StepDetails";
import StepPin from "../create-pin/StepPin";
import StepPath from "../choose-path/StepPath";
import StepCreateClinic from "../create-clinic/StepCreateClinic";
import StepFindClinic from "../find-clinic/StepFindClinic";
import StepConfirmJoin from "../confirm-join/StepConfirmJoin";
import StepPending from "../request-pending/StepPending";
import StepApproved from "../approved/StepApproved";
import StepRejected from "../rejected/StepRejected";
import StepClinicReady from "../clinic-ready/StepClinicReady";

export default function RegisterFlow() {
  const router = useRouter();
  
  // Try to recover step from sessionStorage or default to 'details'
  const [step, setStep] = useState<string>("details");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    let forcedStep = null;
    // Auth guard: If user exists and is approved, kick them out of register flow entirely
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.verification_status === "approved" && user.clinic_id) {
          router.replace("/doctor/dashboard"); // Or wherever their role dictates
          return;
        } else if (user && user.verification_status === "rejected") {
          forcedStep = "rejected";
        } else if (user && user.verification_status === "pending") {
          forcedStep = "pending";
        } else if (user && !user.clinic_id && step === 'details') {
           // they have user but no clinic
           forcedStep = "path";
        }
      } catch (e) {}
    }

    if (forcedStep) {
      setStep(forcedStep);
    } else {
      const savedStep = sessionStorage.getItem("registerStep");
      if (savedStep) {
        setStep(savedStep);
      }
    }
  }, [router]); // only run on mount to avoid infinite loops

  const handleNext = (nextStep: string, data?: any) => {
    // If a step requests routing outside the flow
    if (nextStep === "login") {
      router.push("/login");
      return;
    }
    if (nextStep.startsWith("/")) {
      router.push(nextStep);
      return;
    }
    if (nextStep === "doctor" || nextStep.includes("dashboard") || nextStep === "admin/overview") {
       router.push(`/${nextStep}`);
       return;
    }

    // Map old routes to step names
    const stepMap: Record<string, string> = {
      "create-pin": "pin",
      "choose-path": "path",
      "create-clinic": "create_clinic",
      "find-clinic": "find_clinic",
      "confirm-join": "confirm_join",
      "request-pending": "pending",
      "approved": "approved",
      "rejected": "rejected",
      "clinic-ready": "clinic_ready"
    };

    const targetStep = stepMap[nextStep] || nextStep;
    sessionStorage.setItem("registerStep", targetStep);
    setStep(targetStep);
  };

  if (!mounted) return null;

  switch (step) {
    case "details":
      return <StepDetails onNext={handleNext} />;
    case "pin":
      return <StepPin onNext={handleNext} />;
    case "path":
      return <StepPath onNext={handleNext} />;
    case "create_clinic":
      return <StepCreateClinic onNext={handleNext} />;
    case "find_clinic":
      return <StepFindClinic onNext={handleNext} />;
    case "confirm_join":
      return <StepConfirmJoin onNext={handleNext} />;
    case "pending":
      return <StepPending onNext={handleNext} />;
    case "approved":
      return <StepApproved onNext={handleNext} />;
    case "rejected":
      return <StepRejected onNext={handleNext} />;
    case "clinic_ready":
      return <StepClinicReady onNext={handleNext} />;
    default:
      return <StepDetails onNext={handleNext} />;
  }
}
