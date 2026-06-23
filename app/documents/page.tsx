import { FileText } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { RequireDoctor } from "@/components/shell/require-doctor";
import { RealDataEmptyState } from "@/components/sz/real-data-empty-state";

export default function DocumentsPage() {
  return (
    <RequireDoctor>
    <AppShell className="max-w-[960px]">
      <header className="mb-6">
        <p className="ds-eyebrow text-jade">Documents</p>
        <h1 className="ds-display mt-2 text-[38px] leading-none text-ink">
          Clinical documents
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Notes, instructions, and summaries generated from verified consultations.
        </p>
      </header>

      <RealDataEmptyState
        icon={FileText}
        title="No generated documents yet"
        body="Medical certificates, referral letters, summaries, and patient instructions will appear here after real 0G Compute generation and encrypted 0G Storage."
        primaryLabel="Create consult first"
      />
    </AppShell>
    </RequireDoctor>
  );
}
