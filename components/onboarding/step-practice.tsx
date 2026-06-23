"use client";

import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/onboarding/option-card";

const LANGUAGES = [
  { id: "Tamil", native: "தமிழ்" },
  { id: "Hindi", native: "हिन्दी" },
  { id: "English", native: "English" },
  { id: "Telugu", native: "తెలుగు" },
  { id: "Bengali", native: "বাংলা" },
  { id: "Kannada", native: "ಕನ್ನಡ" },
];

const SPECIALTIES = [
  "General practice",
  "Pediatrics",
  "Obstetrics & Gynaecology",
  "Internal medicine",
  "Cardiology",
  "Other",
];

const MOTIVATIONS = [
  "Reduce after-hours note writing",
  "Give patients a record they can verify",
  "Handle code-switching consults cleanly",
  "Prepare safer follow-up instructions",
];

export type PracticeValues = { languages: string[]; specialty: string; motivation: string };

export function StepPractice({
  values,
  onChange,
  onContinue,
  onBack,
}: {
  values: PracticeValues;
  onChange: (patch: Partial<PracticeValues>) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const ready =
    values.languages.length > 0 &&
    values.specialty.trim().length > 0 &&
    values.motivation.trim().length > 0;

  function toggleLanguage(id: string) {
    const has = values.languages.includes(id);
    onChange({
      languages: has
        ? values.languages.filter((l) => l !== id)
        : [...values.languages, id],
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="ds-eyebrow text-jade">Step 2 of 5</p>
        <h1 className="ds-display mt-2 text-[40px] leading-[1.04] text-ink">
          How do you consult?
        </h1>
        <p className="mt-3 max-w-md text-[15px] text-ink-muted">
          Pick the languages you hear in the room and your area of practice. The scribe transcribes
          and translates them live.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <p className="ds-eyebrow text-ink-dim">What should ScribeZero remove?</p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {MOTIVATIONS.map((m, i) => (
            <OptionCard
              key={m}
              index={i}
              selected={values.motivation === m}
              onClick={() => onChange({ motivation: m })}
            >
              <span className="block pr-6 text-sm font-medium text-ink">{m}</span>
            </OptionCard>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="ds-eyebrow text-ink-dim">Consult languages</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {LANGUAGES.map((lang, i) => (
            <OptionCard
              key={lang.id}
              index={i}
              selected={values.languages.includes(lang.id)}
              onClick={() => toggleLanguage(lang.id)}
            >
              <span className="block text-sm font-medium text-ink">{lang.id}</span>
              <span className="ds-mono mt-0.5 block text-[12px] text-ink-muted">{lang.native}</span>
            </OptionCard>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="ds-eyebrow text-ink-dim">Area of practice</p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {SPECIALTIES.map((s, i) => (
            <OptionCard
              key={s}
              index={i}
              selected={values.specialty === s}
              onClick={() => onChange({ specialty: s })}
            >
              <span className="block text-sm font-medium text-ink">{s}</span>
            </OptionCard>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          variant="live"
          size="lg"
          disabled={!ready}
          onClick={onContinue}
          className="px-7"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
