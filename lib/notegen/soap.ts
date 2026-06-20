/** Builds the SOAP generation prompt and parses the model output. */

export interface SoapFields {
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  summary: string;
}

const SYSTEM = `You are a clinical scribe. From a doctor-patient consultation transcript (which may be in Tamil, Hindi or English), produce a concise, accurate SOAP note in English.

Return ONLY a JSON object with these exact keys and string values:
{"chiefComplaint","subjective","objective","assessment","plan","summary"}

Rules:
- subjective: history in the patient's words, structured.
- objective: vitals/exam findings if mentioned, else state "Not documented in this consultation".
- assessment: most likely clinical impression. This is documentation, NOT a diagnosis or medical advice.
- plan: medications, advice, follow-up.
- summary: 1-2 sentence human-readable note body.
- Be faithful to the transcript. Do not invent findings. No commentary outside the JSON.`;

export function buildMessages(transcript: string): { role: string; content: string }[] {
  return [
    { role: "system", content: SYSTEM },
    { role: "user", content: `Transcript:\n${transcript}\n\nReturn the JSON SOAP note.` },
  ];
}

export function parseSoap(content: string): SoapFields {
  const fallback: SoapFields = {
    chiefComplaint: "",
    subjective: content.trim(),
    objective: "Not documented in this consultation.",
    assessment: "",
    plan: "",
    summary: content.trim().slice(0, 280),
  };
  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    const obj = JSON.parse(match[0]);
    return {
      chiefComplaint: String(obj.chiefComplaint ?? ""),
      subjective: String(obj.subjective ?? ""),
      objective: String(obj.objective ?? "Not documented in this consultation."),
      assessment: String(obj.assessment ?? ""),
      plan: String(obj.plan ?? ""),
      summary: String(obj.summary ?? "").trim() || fallback.summary,
    };
  } catch {
    return fallback;
  }
}
