export type DocumentType =
  | "medical_certificate"
  | "referral_letter"
  | "patient_instructions"
  | "visit_summary";

export type DocumentLanguage = "en" | "hi" | "ta";

export type DocumentGenerationInput = {
  type: DocumentType;
  patientId: string;
  clinicalContext: string;
  recipient?: string;
  duration?: string;
  language: DocumentLanguage;
};

export type GeneratedClinicalDocument = {
  title: string;
  type: DocumentType;
  patientId: string;
  language: DocumentLanguage;
  body: string;
  sections: Array<{ heading: string; text: string }>;
  cautions: string[];
};

const TYPE_LABELS: Record<DocumentType, string> = {
  medical_certificate: "medical certificate",
  referral_letter: "referral letter",
  patient_instructions: "patient instructions",
  visit_summary: "visit summary",
};

const SYSTEM = `You are a careful clinical documentation assistant for an Indian clinic.

Return ONLY a JSON object with these exact keys:
{"title": string, "body": string, "sections": [{"heading": string, "text": string}], "cautions": string[]}

Rules:
- Use only the clinical facts supplied by the doctor.
- Do not invent diagnosis, dates, examination findings, medicines, identity details, or fitness claims.
- If a requested fact is missing, state that it is not documented.
- Keep the document professional and suitable for review by a doctor before issue.
- Write in the requested language when possible.`;

export function validateDocumentInput(input: DocumentGenerationInput) {
  if (!Object.keys(TYPE_LABELS).includes(input.type)) throw new Error("Unsupported document type");
  if (!/^pat_[a-z0-9]{12}$/i.test(input.patientId)) throw new Error("A valid 0G patient id is required");
  if (input.clinicalContext.trim().length < 12) throw new Error("Clinical context is required");
  if (!["en", "hi", "ta"].includes(input.language)) throw new Error("Unsupported document language");
  return {
    type: input.type,
    patientId: input.patientId.trim(),
    clinicalContext: input.clinicalContext.trim(),
    recipient: input.recipient?.trim() || undefined,
    duration: input.duration?.trim() || undefined,
    language: input.language,
  };
}

export function buildDocumentMessages(input: DocumentGenerationInput) {
  const clean = validateDocumentInput(input);
  return [
    { role: "system", content: SYSTEM },
    {
      role: "user",
      content: [
        `Document type: ${TYPE_LABELS[clean.type]}`,
        `Patient id: ${clean.patientId}`,
        `Language: ${clean.language}`,
        clean.recipient ? `Recipient: ${clean.recipient}` : "Recipient: not documented",
        clean.duration ? `Duration: ${clean.duration}` : "Duration: not documented",
        "",
        "Doctor supplied clinical facts:",
        clean.clinicalContext,
        "",
        "Return the JSON document now.",
      ].join("\n"),
    },
  ];
}

export function parseGeneratedDocument(
  content: string,
  input: DocumentGenerationInput,
): GeneratedClinicalDocument {
  const clean = validateDocumentInput(input);
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("0G Compute returned a non-JSON document");
  const parsed = JSON.parse(match[0]) as Partial<GeneratedClinicalDocument>;
  const title = String(parsed.title ?? "").trim();
  const body = String(parsed.body ?? "").trim();
  const sections = Array.isArray(parsed.sections)
    ? parsed.sections
        .map((section) => ({
          heading: String(section?.heading ?? "").trim(),
          text: String(section?.text ?? "").trim(),
        }))
        .filter((section) => section.heading && section.text)
    : [];
  const cautions = Array.isArray(parsed.cautions)
    ? parsed.cautions.map((caution) => String(caution).trim()).filter(Boolean)
    : [];
  if (!title || !body) throw new Error("0G Compute returned an incomplete document");
  return {
    title,
    type: clean.type,
    patientId: clean.patientId,
    language: clean.language,
    body,
    sections,
    cautions,
  };
}

export function documentTypeLabel(type: DocumentType) {
  return TYPE_LABELS[type];
}
