import Link from "next/link";
import { Mic } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

export function NewConsultationCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-surface-1 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-jade-deep bg-surface-2">
          <Mic className="size-[22px] text-jade" />
        </span>
        <div>
          <div className="text-base font-medium text-ink">New consultation</div>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Speak Tamil, Hindi or English — get a structured note you own.
          </p>
        </div>
      </div>
      <Button asChild variant="live" size="lg" className="shrink-0">
        <Link href="/app">
          <Mic className="size-4" />
          Start
        </Link>
      </Button>
    </motion.div>
  );
}
