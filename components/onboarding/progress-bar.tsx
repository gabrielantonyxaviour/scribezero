"use client";

import { Progress } from "@/components/ui/progress";

export function ProgressBar({ step, totalSteps }: { step: number; totalSteps: number }) {
  const percentage = Math.round((step / totalSteps) * 100);

  return (
    <Progress
      value={percentage}
      aria-label={`Onboarding progress ${percentage}%`}
      className="fixed inset-x-0 top-0 z-50 h-1 rounded-none bg-surface-2"
    />
  );
}
