import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDocumentEntries,
  filterDocumentEntries,
  type DocumentLike,
  type DocumentRecordLike,
} from "../lib/documents/library";

const docs: DocumentLike[] = [
  {
    id: "doc-001",
    title: "SOAP note",
    patientId: "pat-001",
    type: "Clinical note",
    status: "Verified",
    updatedAt: "2026-06-19",
    recordId: "note-live",
  },
  {
    id: "doc-002",
    title: "Prescription summary",
    patientId: "pat-002",
    type: "Care instruction",
    status: "Ready",
    updatedAt: "2026-06-16",
    recordId: "note-fallback",
  },
];

const records: DocumentRecordLike[] = [
  {
    id: "note-live",
    root: "0x7efc0811d57026e13b5c1cfb06777d0da087ce8117243b200d52f8956440a579",
    shareCode: "HX7K2M",
    storageMode: "live",
    computeMode: "fallback",
    storageReachable: true,
    computeProofValid: false,
  },
  {
    id: "note-fallback",
    root: "0x4d2e…7f",
    shareCode: "AN28WK",
    storageMode: "fallback",
    computeMode: "fallback",
    storageReachable: false,
    computeProofValid: false,
  },
];

test("builds document entries with their owned record receipts", () => {
  const entries = buildDocumentEntries(docs, records);

  assert.equal(entries[0].record?.shareCode, "HX7K2M");
  assert.equal(entries[1].record?.storageMode, "fallback");
});

test("filters document entries by query and proof status", () => {
  const entries = buildDocumentEntries(docs, records);

  assert.deepEqual(filterDocumentEntries(entries, { query: "antenatal" }).map((d) => d.id), []);
  assert.deepEqual(filterDocumentEntries(entries, { query: "prescription" }).map((d) => d.id), ["doc-002"]);
  assert.deepEqual(filterDocumentEntries(entries, { status: "live" }).map((d) => d.id), ["doc-001"]);
  assert.deepEqual(filterDocumentEntries(entries, { status: "review" }).map((d) => d.id), ["doc-002"]);
  assert.deepEqual(filterDocumentEntries(entries, { status: "fallback" }).map((d) => d.id), ["doc-002"]);
});
