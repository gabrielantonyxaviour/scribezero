"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Selectable card used for language / specialty picks in onboarding. */
export function OptionCard({
  selected,
  onClick,
  children,
  index = 0,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <Button asChild variant="outline" className="h-auto justify-start p-0">
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        aria-pressed={selected}
        className={cn(
          "relative w-full rounded-lg px-4 py-3 text-left",
          selected && "border-jade bg-jade-soft text-ink hover:border-jade hover:bg-jade-soft",
          className,
        )}
      >
        {selected && (
          <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-jade">
            <Check className="size-3 text-[#08140e]" />
          </span>
        )}
        {children}
      </motion.button>
    </Button>
  );
}
