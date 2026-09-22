"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Patient {
  id: string;
  name: string;
  uhid: string;
  phone: string;
  dob: string;
  age: string;
  gender: string;
  insurance: string;
  doctor: string;
  room: string;
  timeSlot: string;
  token: string;
  complaint: string;
  photo?: string;
  status: "waiting" | "called" | "in_consultation" | "completed";
}

export interface Clinic {
  id: string;
  name: string;
  type: string;
  address: string;
}

export interface Doctor {
  name: string;
  role: string;
  npi?: string;
}

export interface Toast {
  title?: string;
  description?: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info' | string;
  icon?: string;
}

interface AppContextType {
  currentDoctor: Doctor | null;
  setCurrentDoctor: (d: Doctor | null) => void;
  currentClinic: Clinic | null;
  setCurrentClinic: (c: Clinic | null) => void;
  activePatient: Patient | null;
  setActivePatient: (p: Patient | null) => void;
  queue: Patient[];
  addToQueue: (p: Patient) => void;
  updatePatientStatus: (id: string, status: Patient["status"]) => void;
  callPatient: (id: string) => void;
  toast: Toast | null;
  showToast: (msg: string | Toast, icon?: string) => void;

  // Compatibility for older usages
  currentPatient?: Patient | null;
  setCurrentPatient?: React.Dispatch<React.SetStateAction<Patient | null>>;
}

const defaultQueue: Patient[] = [
  {
    id: "1",
    name: "Maya Lin Harrison",
    uhid: "UHID-MH-2024-88412",
    phone: "+1 (555) 849-2041",
    dob: "1991-08-14",
    age: "32 yrs",
    gender: "Female",
    insurance: "Blue Cross Blue Shield (Preferred PPO)",
    doctor: "Dr. Eleanor Vance, MD",
    room: "Room 101",
    timeSlot: "10:30 AM",
    token: "T-107",
    complaint: "Seasonal allergy symptoms & persistent dry cough for 5 days with mild nocturnal wheezing.",
    photo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB47H0mBuvtRBI91-e_1-_AQc1VZUhIdW__l3H3EuVcq3KTu5NKo8pyUiMNoQ6grSCTnbjYG8ZRx2O3wuLjkOcVZaUeU_eG8CK9rTvV8rZHN686cqY8h6G9SmDjk22Mt8b1uvP4exn3WJ-TAbzcZHf90ZT882zAc6u7KjcZH-AQKztScbf0yPQ1e3Pq-1eGDGDXUB8n2zTHhlRiroSU2V24w0fqCff2KTgJTSaydLHg4fFWRObnHU_azg",
    status: "waiting",
  },
  {
    id: "2",
    name: "Robert Chen",
    uhid: "UHID-RC-2024-44219",
    phone: "+1 (555) 312-7741",
    dob: "1968-03-22",
    age: "56 yrs",
    gender: "Male",
    insurance: "Medicare Part B",
    doctor: "Dr. Eleanor Vance, MD",
    room: "Room 101",
    timeSlot: "11:00 AM",
    token: "T-108",
    complaint: "Follow-up for hypertension management.",
    status: "waiting",
  },
  {
    id: "3",
    name: "Priya Sharma",
    uhid: "UHID-PS-2024-91234",
    phone: "+1 (555) 677-4490",
    dob: "2001-11-05",
    age: "22 yrs",
    gender: "Female",
    insurance: "Aetna Student Health",
    doctor: "Dr. Eleanor Vance, MD",
    room: "Room 101",
    timeSlot: "11:30 AM",
    token: "T-109",
    complaint: "Recurring migraine headaches.",
    status: "waiting",
  },
];

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>({
    name: "Dr. Eleanor Vance, MD",
    role: "Attending Physician / Admin",
    npi: "1849204918",
  });

  const [currentClinic, setCurrentClinic] = useState<Clinic | null>({
    id: "clinic-001",
    name: "Metropolitan Health Medical Center",
    type: "Multispecialty Outpatient Clinic",
    address: "742 Evergreen Medical Parkway, Suite 400, San Francisco, CA 94107",
  });

  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [queue, setQueue] = useState<Patient[]>(defaultQueue);
  const [toast, setToast] = useState<Toast | null>(null);

  const addToQueue = useCallback((p: Patient) => {
    setQueue((prev) => [...prev, p]);
  }, []);

  const updatePatientStatus = useCallback((id: string, status: Patient["status"]) => {
    setQueue((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }, []);

  const callPatient = useCallback((id: string) => {
    setQueue((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "called" } : p))
    );
    const patient = queue.find((p) => p.id === id) || null;
    setActivePatient(patient);
  }, [queue]);

  const showToast = useCallback((msg: string | Toast, icon?: string) => {
    if (typeof msg === 'string') {
      setToast({ message: msg, icon: icon || "check_circle", type: "success" });
    } else {
      setToast({ ...msg, icon: msg.icon || (msg.type === "error" ? "error" : "check_circle") });
    }
    setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentDoctor,
        setCurrentDoctor,
        currentClinic,
        setCurrentClinic,
        activePatient,
        setActivePatient,
        currentPatient: activePatient,
        setCurrentPatient: setActivePatient,
        queue,
        addToQueue,
        updatePatientStatus,
        callPatient,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
