"use client";

import Image from "next/image";

const STEP_IMAGES = [
  "/scribe-zero/onboarding-1.jpg",
  "/scribe-zero/onboarding-2.jpg",
  "/scribe-zero/onboarding-3.jpg",
  "/scribe-zero/onboarding-4.jpg",
  "/scribe-zero/onboarding-5.jpg",
] as const;

/** Full-bleed step artwork for the onboarding right rail. */
export function OnboardingAside({ step }: { step: number }) {
  const src = STEP_IMAGES[Math.max(0, Math.min(step - 1, STEP_IMAGES.length - 1))];

  return (
    <div className="relative size-full overflow-hidden bg-surface-2">
      <Image
        src={src}
        alt=""
        fill
        sizes="50vw"
        priority={step === 1}
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent via-bg/5 to-bg/35" />
    </div>
  );
}
