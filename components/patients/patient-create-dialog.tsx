"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { useWallet } from "@/components/providers/wallet-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildEncryptedPatientArtifact, type PatientLanguage } from "@/lib/patients/artifact";

const defaultForm = {
  fullName: "",
  birthYear: "",
  phone: "",
  preferredLanguage: "ta" as PatientLanguage,
  notes: "",
};

function short(value: string, start = 10, end = 6) {
  if (!value) return "";
  return value.length <= start + end ? value : `${value.slice(0, start)}…${value.slice(-end)}`;
}

async function readJson<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || `${res.status} ${res.statusText}`);
  return body as T;
}

export function PatientCreateDialog({ onCreated }: { onCreated: () => Promise<void> }) {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState(defaultForm);

  async function createPatient() {
    if (!wallet.connected || !wallet.address) throw new Error("Connect a wallet before creating a patient");
    setPending(true);
    try {
      const artifact = await buildEncryptedPatientArtifact({
        ownerAddress: wallet.address,
        patient: form,
        signMessage: wallet.signMessage,
      });
      const stored = await fetch("/api/store", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ artifact }),
      }).then((res) => readJson<{ rootHash: string; txHash: string }>(res));
      const indexed = await fetch("/api/patients/index", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          artifact,
          storageRootHash: stored.rootHash,
          storageTxHash: stored.txHash,
        }),
      }).then((res) => readJson<{ txHash: string; patientId: string }>(res));
      toast.success("Patient encrypted, stored, and indexed on 0G", {
        description: `${indexed.patientId} · ${short(indexed.txHash)}`,
      });
      setOpen(false);
      setForm(defaultForm);
      await onCreated();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="live">
          <UserPlus className="size-4" />
          New patient
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Create encrypted patient</DialogTitle>
          <DialogDescription>
            The patient profile is encrypted client-side with a wallet signature before 0G Storage.
            KV stores only the owner, patient id, root, tx, and commitment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Full name</FieldLabel>
            <Input
              value={form.fullName}
              onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              placeholder="Meera Krishnan"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel>Birth year</FieldLabel>
            <Input
              value={form.birthYear}
              onChange={(event) => setForm((prev) => ({ ...prev, birthYear: event.target.value }))}
              placeholder="1988"
              inputMode="numeric"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel>Phone</FieldLabel>
            <Input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="+91…"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel>Language</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {(["ta", "hi", "en"] as const).map((language) => (
                <Button
                  key={language}
                  type="button"
                  variant={form.preferredLanguage === language ? "live" : "outline"}
                  onClick={() => setForm((prev) => ({ ...prev, preferredLanguage: language }))}
                  disabled={pending}
                >
                  {language.toUpperCase()}
                </Button>
              ))}
            </div>
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel>Private notes</FieldLabel>
            <Textarea
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Clinical context, consent notes, or care preferences"
              disabled={pending}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button
            variant="live"
            disabled={pending || !form.fullName.trim() || !form.birthYear.trim()}
            onClick={() => {
              toast.promise(createPatient(), {
                loading: "Encrypting and writing to 0G…",
                error: (err) => `0G patient creation failed: ${(err as Error).message}`,
              });
            }}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            Store on 0G
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
