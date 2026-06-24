import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDocumentMessages,
  parseGeneratedDocument,
  validateDocumentInput,
} from "../lib/documents/generation";

const input = {
  type: "medical_certificate" as const,
  patientId: "pat_507b26327be9",
  clinicalContext: "Fever for two days. Doctor advised rest and hydration.",
  recipient: "Employer",
  duration: "2 days",
  language: "en" as const,
};

test("builds 0G document generation messages from doctor supplied facts", () => {
  const messages = buildDocumentMessages(input);

  assert.equal(messages.length, 2);
  assert.match(messages[1].content, /medical certificate/);
  assert.match(messages[1].content, /Fever for two days/);
});

test("parses a generated clinical document strictly", () => {
  const document = parseGeneratedDocument(
    JSON.stringify({
      title: "Medical Certificate",
      body: "This is to certify that the patient was reviewed.",
      sections: [{ heading: "Advice", text: "Rest and hydration." }],
      cautions: ["Doctor review required before issue."],
    }),
    input,
  );

  assert.equal(document.type, "medical_certificate");
  assert.equal(document.patientId, "pat_507b26327be9");
  assert.equal(document.sections[0].heading, "Advice");
});

test("rejects incomplete document generation input and output", () => {
  assert.throws(
    () => validateDocumentInput({ ...input, clinicalContext: "short" }),
    /Clinical context/,
  );
  assert.throws(() => parseGeneratedDocument("not json", input), /non-JSON/);
});
