import { DEMO_RECORDS } from "@/lib/mock/data";

export type TaskStatus = "due" | "ready" | "done";
export type PatientRisk = "routine" | "watch" | "urgent";

export const DOCTOR_PROFILE = {
  name: "Dr. Ananya Rao",
  clinic: "ScribeZero Demo Clinic",
  role: "General practice",
  languageLine: "Tamil, Hindi, English",
  location: "Chennai",
};

export const ONBOARDING_STEPS = [
  {
    id: "profile",
    title: "Clinic profile",
    body: "Confirm name, location, and default consult language.",
    status: "done",
  },
  {
    id: "sign-in",
    title: "Doctor sign-in",
    body: "Use email or Google. No wallet app needed for daily work.",
    status: "done",
  },
  {
    id: "sample",
    title: "Try sample consult",
    body: "Run the Tamil fever consult and review the SOAP note.",
    status: "ready",
  },
  {
    id: "seal",
    title: "Save first owned record",
    body: "Seal a note to 0G Storage and verify the receipt.",
    status: "ready",
  },
] as const;

export const PATIENTS = [
  {
    id: "pat-001",
    name: "Ravi Narayanan",
    age: 38,
    sex: "M",
    phone: "+91 98765 12044",
    language: "Tamil",
    risk: "watch" as PatientRisk,
    lastVisit: "2026-06-19",
    reason: "Fever, dry cough & body ache",
    summary: "Viral URI watch. Review if fever persists or breathing worsens.",
    recordId: DEMO_RECORDS[0].id,
  },
  {
    id: "pat-002",
    name: "Meera Sharma",
    age: 29,
    sex: "F",
    phone: "+91 99801 44210",
    language: "Hindi",
    risk: "routine" as PatientRisk,
    lastVisit: "2026-06-16",
    reason: "Routine antenatal check, 28 weeks",
    summary: "Stable antenatal visit. Routine iron/calcium adherence check.",
    recordId: DEMO_RECORDS[1].id,
  },
  {
    id: "pat-003",
    name: "Karthik Subramaniam",
    age: 52,
    sex: "M",
    phone: "+91 98408 77231",
    language: "Tamil",
    risk: "watch" as PatientRisk,
    lastVisit: "2026-06-12",
    reason: "Diabetes follow-up, HbA1c review",
    summary: "Medication adherence good. Diet counseling repeated.",
    recordId: DEMO_RECORDS[2].id,
  },
  {
    id: "pat-004",
    name: "Aisha Khan",
    age: 1,
    sex: "F",
    phone: "+91 99007 88210",
    language: "Hindi",
    risk: "routine" as PatientRisk,
    lastVisit: "2026-06-09",
    reason: "Child immunisation - 9 months",
    summary: "Vaccine counseling complete. Next visit scheduled.",
    recordId: DEMO_RECORDS[3].id,
  },
];

export const APPOINTMENTS = [
  {
    id: "appt-001",
    time: "09:30",
    patientId: "pat-001",
    kind: "Follow-up",
    status: "Ready for review",
  },
  {
    id: "appt-002",
    time: "10:15",
    patientId: "pat-002",
    kind: "Antenatal check",
    status: "Intake complete",
  },
  {
    id: "appt-003",
    time: "11:00",
    patientId: "pat-003",
    kind: "Diabetes review",
    status: "Needs note",
  },
];

export const TASKS = [
  {
    id: "task-001",
    title: "Review Ravi's fever safety net",
    patientId: "pat-001",
    status: "due" as TaskStatus,
    due: "Today",
  },
  {
    id: "task-002",
    title: "Send Meera's antenatal summary",
    patientId: "pat-002",
    status: "ready" as TaskStatus,
    due: "Today",
  },
  {
    id: "task-003",
    title: "Verify diabetes follow-up receipt",
    patientId: "pat-003",
    status: "ready" as TaskStatus,
    due: "Tomorrow",
  },
  {
    id: "task-004",
    title: "Archive child vaccine note",
    patientId: "pat-004",
    status: "done" as TaskStatus,
    due: "Done",
  },
];

export const DOCUMENTS = [
  {
    id: "doc-001",
    title: "SOAP note",
    patientId: "pat-001",
    type: "Clinical note",
    status: "Verified",
    updatedAt: "2026-06-19",
  },
  {
    id: "doc-002",
    title: "Prescription summary",
    patientId: "pat-002",
    type: "Care instruction",
    status: "Ready",
    updatedAt: "2026-06-16",
  },
  {
    id: "doc-003",
    title: "Diabetes follow-up plan",
    patientId: "pat-003",
    type: "Follow-up",
    status: "Verified",
    updatedAt: "2026-06-12",
  },
];

export const SETTINGS = [
  {
    title: "Clinic identity",
    body: "Clinic name, doctor signature, city, and default language.",
  },
  {
    title: "Note template",
    body: "SOAP layout, safety-net phrase, and patient-friendly summary style.",
  },
  {
    title: "Data controls",
    body: "Export records, request deletion, and inspect verification receipts.",
  },
];

export function getPatient(id: string) {
  return PATIENTS.find((patient) => patient.id === id);
}

export function patientName(id: string) {
  return getPatient(id)?.name ?? "Unknown patient";
}
