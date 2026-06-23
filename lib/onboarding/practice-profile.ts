export type PracticeProfileArtifact = {
  kind: "scribezero.practice-profile";
  version: 1;
  ownerAddress: string;
  createdAt: string;
  doctor: {
    name: string;
    specialty: string;
    degrees?: string;
    registrationNumber?: string;
    registrationCouncil?: string;
  };
  practice: {
    clinic: string;
    city?: string;
    languages: string[];
    motivation: string;
  };
  demo: {
    sampleConsultReviewed: boolean;
    sampleConsultCode: string;
    noteGeneration: "0g-compute-teetls";
    storage: "0g-storage";
  };
};

export type PracticeProfileInput = {
  name: string;
  clinic: string;
  city: string;
  specialty: string;
  languages: string[];
  motivation: string;
  degrees?: string;
  registrationNumber?: string;
  registrationCouncil?: string;
  sampleConsultReviewed: boolean;
};

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function buildPracticeProfileArtifact(
  profile: PracticeProfileInput,
  ownerAddress: string,
  createdAt = new Date().toISOString(),
): PracticeProfileArtifact {
  return {
    kind: "scribezero.practice-profile",
    version: 1,
    ownerAddress,
    createdAt,
    doctor: {
      name: profile.name.trim(),
      specialty: profile.specialty.trim(),
      degrees: profile.degrees?.trim() || undefined,
      registrationNumber: profile.registrationNumber?.trim() || undefined,
      registrationCouncil: profile.registrationCouncil?.trim() || undefined,
    },
    practice: {
      clinic: profile.clinic.trim(),
      city: profile.city.trim() || undefined,
      languages: profile.languages,
      motivation: profile.motivation,
    },
    demo: {
      sampleConsultReviewed: profile.sampleConsultReviewed,
      sampleConsultCode: "SZ-4827-TA",
      noteGeneration: "0g-compute-teetls",
      storage: "0g-storage",
    },
  };
}

export function isPracticeProfileArtifact(value: unknown): value is PracticeProfileArtifact {
  const v = value as Partial<PracticeProfileArtifact> | null;
  return Boolean(
    v &&
      v.kind === "scribezero.practice-profile" &&
      v.version === 1 &&
      typeof v.ownerAddress === "string" &&
      /^0x[0-9a-fA-F]{40}$/.test(v.ownerAddress) &&
      typeof v.createdAt === "string" &&
      typeof v.doctor?.name === "string" &&
      v.doctor.name.trim().length > 0 &&
      typeof v.doctor?.specialty === "string" &&
      v.doctor.specialty.trim().length > 0 &&
      typeof v.practice?.clinic === "string" &&
      v.practice.clinic.trim().length > 0 &&
      Array.isArray(v.practice?.languages) &&
      v.practice.languages.length > 0 &&
      v.practice.languages.every((language) => typeof language === "string" && language.trim()) &&
      typeof v.practice?.motivation === "string" &&
      v.practice.motivation.trim().length > 0 &&
      v.demo?.noteGeneration === "0g-compute-teetls" &&
      v.demo?.storage === "0g-storage",
  );
}
