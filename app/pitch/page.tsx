import Link from "next/link";
import Image from "next/image";

const proofPoints = [
  ["01", "Consult", "Tamil and Hindi speech becomes a structured SOAP note without forcing the doctor into English-first input."],
  ["02", "Seal", "0G Compute and 0G Storage turn the note into a private record with a public integrity handle."],
  ["03", "Verify", "Judges can inspect receipts and verify the record without seeing private medical content."],
];

const slides = [
  {
    number: "01",
    label: "Why now",
    title: "Clinical memory is being rebuilt by AI. Patients should own it.",
    body: "In India, care often happens in local language, but records become siloed English summaries. ScribeZero keeps the consult natural, then creates a verifiable record the patient can carry.",
  },
  {
    number: "02",
    label: "Product",
    title: "A bilingual health scribe that ends with proof, not a PDF.",
    body: "Record or play a consult, generate a SOAP note, seal it as a private 0G artifact, and verify it later from the receipt alone.",
  },
  {
    number: "03",
    label: "0G layer",
    title: "Remove 0G and the promise breaks.",
    body: "0G Compute is the neutral execution layer. 0G Storage is the patient ownership handle. Together they separate useful AI from blind trust in an app database.",
  },
];

export default function PitchPage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="mx-auto grid min-h-screen max-w-7xl gap-10 px-5 py-10 md:grid-cols-[0.96fr_1.04fr] md:items-center md:px-8">
        <div className="space-y-8">
          <Link
            href="/"
            className="inline-flex rounded-full border border-line px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted hover:text-ink"
          >
            ScribeZero / judge deck
          </Link>
          <div className="space-y-5">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Zero Cup submission</p>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-ink md:text-7xl">
              Spoken care becomes patient-owned proof.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              ScribeZero is an Indian-language AI health scribe for Tamil and Hindi consults. It is built
              for the moment when a useful medical note also needs a private, verifiable ownership trail.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-md bg-accent px-5 py-3 text-sm font-bold text-black" href="/app">
              Open live scribe
            </Link>
            <a className="rounded-md border border-line px-5 py-3 text-sm font-bold" href="/demo.mp4">
              Watch demo cut
            </a>
          </div>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-panel shadow-2xl shadow-accent/10">
          <Image
            src="/scribe-zero/onboarding-1.jpg"
            alt="ScribeZero consult preview"
            fill
            sizes="(min-width: 768px) 48vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">Demo focus</p>
            <p className="mt-2 max-w-xl text-2xl font-black leading-tight">
              Consult to SOAP note to private verification receipt in under one minute.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-12 md:px-8">
        {slides.map((section) => (
          <article
            key={section.number}
            className="grid gap-5 rounded-lg border border-line bg-panel p-6 md:grid-cols-[160px_1fr]"
          >
            <div>
              <p className="text-5xl font-black text-accent">{section.number}</p>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-muted">{section.label}</p>
            </div>
            <div>
              <h2 className="text-3xl font-black leading-tight md:text-5xl">{section.title}</h2>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{section.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="border-y border-line py-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h2 className="max-w-3xl text-3xl font-black md:text-5xl">What judges should verify</h2>
            <a className="rounded-md border border-line px-5 py-3 text-sm font-bold" href="/demo.mp4">
              /demo.mp4
            </a>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {proofPoints.map(([number, label, point]) => (
              <div key={number} className="rounded-md border border-line bg-panel p-5">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
                  {number} / {label}
                </p>
                <p className="mt-4 leading-7 text-muted">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
