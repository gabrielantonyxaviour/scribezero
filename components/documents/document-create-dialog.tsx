"use client";

import { useState } from "react";
import { FileCheck2, Loader2 } from "lucide-react";
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
import { buildEncryptedDocumentArtifact } from "@/lib/documents/artifact";
import {
  documentTypeLabel,
  type DocumentLanguage,
  type DocumentType,
  type GeneratedClinicalDocument,
} from "@/lib/documents/generation";
import type { ComputeProof } from "@/lib/0g/compute";
import type { PatientIndexEntry } from "@/lib/patients/kv-index";
import type { SarvamFallback } from "@/lib/sarvam";

const DOCUMENT_TYPES: DocumentType[] = [
  "medical_certificate",
  "referral_letter",
  "patient_instructions",
  "visit_summary",
];

const defaultForm = {
  type: "medical_certificate" as DocumentType,
  patientId: "",
  clinicalContext: "",
  recipient: "",
  duration: "",
  language: "en" as DocumentLanguage,
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

export function DocumentCreateDialog({
  patients,
  onCreated,
  computeNotice = "",
}: {
  patients: PatientIndexEntry[];
  onCreated: () => Promise<void>;
  computeNotice?: string;
}) {
  const wallet = useWallet();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState(defaultForm);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && !form.patientId && patients[0]) {
      setForm((prev) => ({ ...prev, patientId: patients[0].patientId }));
    }
  }


  async function createDocument() {
    if (!wallet.connected || !wallet.address) throw new Error("Connect a wallet before creating a document");
    if (!form.patientId) throw new Error("Select a 0G-indexed patient first");
    setPending(true);
    try {
      const generated = await fetch("/api/documentgen", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      }).then((res) =>
        readJson<{
          document: GeneratedClinicalDocument;
          proof: ComputeProof;
          fallback?: SarvamFallback;
        }>(res),
      );
      const artifact = await buildEncryptedDocumentArtifact({
        ownerAddress: wallet.address,
        document: generated.document,
        computeProof: generated.proof,
        signMessage: wallet.signMessage,
      });
      const stored = await fetch("/api/store", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ artifact }),
      }).then((res) => readJson<{ rootHash: string; txHash: string }>(res));
      const indexed = await fetch("/api/documents/index", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          artifact,
          storageRootHash: stored.rootHash,
          storageTxHash: stored.txHash,
        }),
      }).then((res) => readJson<{ txHash: string; documentId: string }>(res));
      toast.success("Document generated, encrypted, and indexed on 0G", {
        description: generated.fallback
          ? `Sarvam fallback: ${generated.fallback.zerogError}`
          : `${indexed.documentId} · ${short(indexed.txHash)}`,
      });
      setOpen(false);
      setForm(defaultForm);
      await onCreated();
    } catch (error) {
      await onCreated();
      throw error;
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="live"
          disabled={!patients.length}
          title={computeNotice || (!patients.length ? "Create a 0G-indexed patient first" : undefined)}
        >
          <FileCheck2 className="size-4" />
          New document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <DialogTitle>Generate 0G document</DialogTitle>
          <DialogDescription>
            0G Compute writes the document, then your wallet encrypts it before 0G Storage. The
            KV index stores only proof handles and generic document labels.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel>Patient</FieldLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {patients.map((patient) => (
              <Button
                key={patient.patientId}
                type="button"
                variant={form.patientId === patient.patientId ? "live" : "outline"}
                onClick={() => setForm((prev) => ({ ...prev, patientId: patient.patientId }))}
                disabled={pending}
                className="justify-start"
              >
                {patient.patientId} · {patient.preferredLanguage.toUpperCase()}
              </Button>
            ))}
          </div>
        </Field>
        <Field>
          <FieldLabel>Document type</FieldLabel>
          <div className="grid gap-2 sm:grid-cols-2">
            {DOCUMENT_TYPES.map((type) => (
              <Button
                key={type}
                type="button"
                variant={form.type === type ? "live" : "outline"}
                onClick={() => setForm((prev) => ({ ...prev, type }))}
                disabled={pending}
                className="justify-start"
              >
                {documentTypeLabel(type)}
              </Button>
            ))}
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Recipient</FieldLabel>
            <Input
              value={form.recipient}
              onChange={(event) => setForm((prev) => ({ ...prev, recipient: event.target.value }))}
              placeholder="Employer, school, specialist, or patient"
              disabled={pending}
            />
          </Field>
          <Field>
            <FieldLabel>Duration</FieldLabel>
            <Input
              value={form.duration}
              onChange={(event) => setForm((prev) => ({ ...prev, duration: event.target.value }))}
              placeholder="3 days rest, 1 week review, etc."
              disabled={pending}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel>Doctor supplied clinical facts</FieldLabel>
          <Textarea
            value={form.clinicalContext}
            onChange={(event) => setForm((prev) => ({ ...prev, clinicalContext: event.target.value }))}
            placeholder="Only facts you want the 0G Compute model to use. Do not include anything you do not want in the generated document."
            disabled={pending}
            className="min-h-28"
          />
        </Field>
        <Field>
          <FieldLabel>Language</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {(["en", "hi", "ta"] as const).map((language) => (
              <Button
                key={language}
                type="button"
                variant={form.language === language ? "live" : "outline"}
                onClick={() => setForm((prev) => ({ ...prev, language }))}
                disabled={pending}
              >
                {language.toUpperCase()}
              </Button>
            ))}
          </div>
        </Field>
        <DialogFooter>
          <Button
            variant="live"
            disabled={pending || !form.patientId || form.clinicalContext.trim().length < 12}
            onClick={() => {
              toast.promise(createDocument(), {
                loading: "Generating through 0G Compute…",
                error: (err) => `0G document generation failed: ${(err as Error).message}`,
              });
            }}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <FileCheck2 className="size-4" />}
            Generate and seal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
