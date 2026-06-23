"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export type IdentityValues = { name: string; clinic: string; city: string };

export function StepIdentity({
  values,
  onChange,
  onContinue,
}: {
  values: IdentityValues;
  onChange: (patch: Partial<IdentityValues>) => void;
  onContinue: () => void;
}) {
  const ready = values.name.trim().length > 1 && values.clinic.trim().length > 1;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onContinue();
      }}
    >
      <header>
        <p className="ds-eyebrow text-jade">Step 1 of 5</p>
        <h1 className="ds-display mt-2 text-[40px] leading-[1.04] text-ink">
          Who owns these records?
        </h1>
        <p className="mt-3 max-w-md text-[15px] text-ink-muted">
          Every note you seal is bound to your wallet. Tell us who you are so the record carries
          your name.
        </p>
      </header>

      <FieldGroup>
        <IdentityField id="ob-name" label="Your name">
          <Input
            id="ob-name"
            autoFocus
            value={values.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Dr. Ananya Rao"
          />
        </IdentityField>
        <IdentityField id="ob-clinic" label="Clinic or practice">
          <Input
            id="ob-clinic"
            value={values.clinic}
            onChange={(e) => onChange({ clinic: e.target.value })}
            placeholder="Rao Family Clinic"
          />
        </IdentityField>
        <IdentityField id="ob-city" label="City" hint="Optional">
          <Input
            id="ob-city"
            value={values.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Chennai"
          />
        </IdentityField>
      </FieldGroup>

      <div>
        <Button type="submit" variant="live" size="lg" disabled={!ready} className="px-7">
          Continue
        </Button>
      </div>
    </form>
  );
}

function IdentityField({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Field>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={id}>
          {label}
        </FieldLabel>
        {hint && <span className="ds-mono text-[10px] uppercase text-ink-dim">{hint}</span>}
      </div>
      {children}
    </Field>
  );
}
