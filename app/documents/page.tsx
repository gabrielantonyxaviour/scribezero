import Link from "next/link";
import { Download, FileText, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { DOCUMENTS, patientName } from "@/lib/mock/product";

export default function DocumentsPage() {
  return (
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

      <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="divide-y divide-border">
          {DOCUMENTS.map((doc) => (
            <div key={doc.id} className="grid gap-4 px-4 py-4 sm:grid-cols-[1fr_140px_120px] sm:items-center">
              <div className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface-3 text-jade">
                  <FileText className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{doc.title}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {patientName(doc.patientId)} · {doc.type}
                  </p>
                </div>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-jade-deep px-2 py-1 text-xs text-jade">
                <ShieldCheck className="size-3" />
                {doc.status}
              </span>
              <Button asChild variant="outline" size="sm">
                <Link href={`/patients/${doc.patientId}`}>
                  <Download className="size-3.5" />
                  Open
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
