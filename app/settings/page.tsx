import { Database, FileText, Hospital } from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";
import { SETTINGS } from "@/lib/mock/product";

const ICONS = [Hospital, FileText, Database];

export default function SettingsPage() {
  return (
    <AppShell className="max-w-[900px]">
      <header className="mb-6">
        <p className="ds-eyebrow text-jade">Settings</p>
        <h1 className="ds-display mt-2 text-[38px] leading-none text-ink">
          Clinic controls
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          The same product spine Larinova uses: identity, templates, and data controls.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {SETTINGS.map((setting, index) => {
          const Icon = ICONS[index] ?? FileText;
          return (
            <section key={setting.title} className="rounded-xl border border-border bg-surface-1 p-4">
              <span className="flex size-10 items-center justify-center rounded-md border border-border bg-surface-3 text-jade">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 text-sm font-medium text-ink">{setting.title}</h2>
              <p className="mt-2 text-sm text-ink-muted">{setting.body}</p>
              <button className="mt-4 text-xs font-medium text-jade">Configure</button>
            </section>
          );
        })}
      </div>

      <section className="mt-5 rounded-xl border border-border bg-surface-1 p-5">
        <p className="ds-eyebrow text-ink-dim">Data posture</p>
        <p className="mt-3 max-w-2xl text-sm text-ink-muted">
          Patient records stay anchored to their owner address and verification receipt. Export and
          deletion controls are modeled here for product completeness; production wiring should be
          added after the demo data layer becomes real.
        </p>
      </section>
    </AppShell>
  );
}
