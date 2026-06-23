"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export type CredentialValues = {
  degrees: string;
  registrationNumber: string;
  registrationCouncil: string;
};

export function StepCredentials({
  values,
  onChange,
  onContinue,
  onBack,
}: {
  values: CredentialValues;
  onChange: (patch: Partial<CredentialValues>) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const ready =
    values.degrees.trim().length > 1 &&
    values.registrationNumber.trim().length > 1 &&
    values.registrationCouncil.trim().length > 1;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onContinue();
      }}
    >
      <header>
        <p className="ds-eyebrow text-jade">Step 3 of 5</p>
        <h1 className="ds-display mt-2 text-[40px] leading-[1.04] text-ink">
          Add clinical credentials.
        </h1>
        <p className="mt-3 max-w-md text-[15px] text-ink-muted">
          This becomes part of the practice profile sealed to 0G Storage and bound to your wallet.
        </p>
      </header>

      <FieldGroup>
        <CredentialField id="ob-degrees" label="Degrees">
          <Input
            id="ob-degrees"
            value={values.degrees}
            onChange={(e) => onChange({ degrees: e.target.value })}
            placeholder="MBBS, DNB Family Medicine"
          />
        </CredentialField>
        <CredentialField id="ob-reg" label="Registration number">
          <Input
            id="ob-reg"
            value={values.registrationNumber}
            onChange={(e) => onChange({ registrationNumber: e.target.value })}
            placeholder="TNMC 84217"
          />
        </CredentialField>
        <CredentialField id="ob-council" label="Medical council">
          <Input
            id="ob-council"
            value={values.registrationCouncil}
            onChange={(e) => onChange({ registrationCouncil: e.target.value })}
            placeholder="Tamil Nadu Medical Council"
          />
        </CredentialField>
      </FieldGroup>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="live" size="lg" disabled={!ready} className="px-7">
          Continue
        </Button>
      </div>
    </form>
  );
}

function CredentialField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
      </FieldLabel>
      {children}
    </Field>
  );
}
