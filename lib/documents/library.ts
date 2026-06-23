export type DocumentStatusFilter = "all" | "live" | "review" | "fallback";

export type DocumentRecordLike = {
  id: string;
  root: string;
  shareCode: string;
  storageMode: "live" | "fallback";
  computeMode: "live" | "fallback";
  storageReachable: boolean;
  computeProofValid: boolean;
};

export type DocumentLike = {
  id: string;
  title: string;
  patientId: string;
  type: string;
  status: string;
  updatedAt: string;
  recordId: string;
};

export type DocumentEntry<TDocument extends DocumentLike = DocumentLike> = TDocument & {
  record?: DocumentRecordLike;
};

export function buildDocumentEntries<TDocument extends DocumentLike>(
  documents: TDocument[],
  records: DocumentRecordLike[],
): DocumentEntry<TDocument>[] {
  return documents.map((doc) => ({
    ...doc,
    record: records.find((record) => record.id === doc.recordId),
  }));
}

export function filterDocumentEntries<TDocument extends DocumentLike>(
  entries: DocumentEntry<TDocument>[],
  filters: { query?: string; status?: DocumentStatusFilter },
) {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const status = filters.status ?? "all";

  return entries.filter((entry) => {
    const haystack = [
      entry.title,
      entry.type,
      entry.status,
      entry.patientId,
      entry.record?.shareCode,
      entry.record?.root,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesStatus =
      status === "all" ||
      (status === "live" && entry.record?.storageMode === "live") ||
      (status === "review" && entry.status.toLowerCase() !== "verified") ||
      (status === "fallback" && entry.record?.storageMode !== "live");

    return matchesQuery && matchesStatus;
  });
}
