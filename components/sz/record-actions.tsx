"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FileDown, LockKeyhole, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { buildRecordExportBundle } from "@/lib/records/export-bundle";
import type { StoredScribeRecord } from "@/lib/records/local-record";
import type { ConsultNote, OwnedRecord, VerificationResult } from "@/shared/contract";
import type { ProofReceiptInput } from "@/lib/proof/receipt";

type RecordActionsProps = {
  note: ConsultNote;
  record: OwnedRecord;
  verification: VerificationResult;
  proof: ProofReceiptInput;
  shareCode: string;
  storedRecord?: StoredScribeRecord | null;
  computeProof?: StoredScribeRecord["computeProof"];
};

function saveTextFile(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function fileSafe(id: string) {
  return id.replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
}

export function RecordActions({
  note,
  record,
  verification,
  proof,
  shareCode,
  computeProof,
}: RecordActionsProps) {
  const [downloading, setDownloading] = useState(false);

  function exportProofBundle() {
    const bundle = buildRecordExportBundle({
      note,
      record,
      verification,
      proof,
      computeProof,
      shareCode,
      origin: window.location.origin,
    });
    saveTextFile(
      `scribezero-${fileSafe(note.id)}-proof.json`,
      JSON.stringify(bundle, null, 2),
      "application/json",
    );
    toast.success("Proof bundle exported");
  }

  async function downloadFrom0G() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/0g/download?root=${encodeURIComponent(record.zgStorageRootHash)}`);
      const body = await res.text();
      if (!res.ok) {
        throw new Error(body || `0G download failed with ${res.status}`);
      }
      saveTextFile(`scribezero-${fileSafe(note.id)}-0g.json`, body, "application/json");
      toast.success("Downloaded from 0G Storage");
    } catch (error) {
      toast.error((error as Error).message || "0G download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/r/${shareCode}`}>
            <Share2 /> Share record
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={exportProofBundle}>
          <FileDown /> Export proof JSON
        </Button>
        <Button variant="outline" size="sm" onClick={downloadFrom0G} disabled={downloading}>
          <Download /> {downloading ? "Downloading…" : "Download from 0G"}
        </Button>
        <Button variant="outline" size="sm" className="text-ink-dim" disabled>
          <LockKeyhole /> Non-transferable record
        </Button>
      </div>
  );
}

export function recordActionsFromStored(stored: StoredScribeRecord): RecordActionsProps {
  return {
    note: stored.note,
    record: stored.record,
    verification: stored.verification,
    proof: stored.proof,
    shareCode: stored.shareCode,
    storedRecord: stored,
    computeProof: stored.computeProof,
  };
}
