import Link from "next/link";
import Image from "next/image";

const proofPoints = [
  "Tamil and Hindi consult flow turns speech into a structured clinical note.",
  "0G Compute produces the note when router credentials are available.",
  "0G Storage is the ownership handle for every sealed record.",
  "Verification keeps note contents private while making integrity public.",
];

const sections = [
  {
    kicker: "Problem",
    title: "Clinical notes should not erase local language.",
    body:
      "Doctors and patients often speak in Tamil or Hindi, while clinical systems expect structured English notes. ScribeZero keeps the consult natural and turns it into a verifiable record.",
  },
  {
    kicker: "Product",
    title: "A bilingual health scribe with ownership built in.",
    body:
      "The user records or plays a consult, generates a SOAP note, receives a 0G receipt, and can verify the record later without revealing private medical details.",
  },
  {
    kicker: "Why 0G",
    title: "Remove 0G and the promise breaks.",
    body:
      "Compute proof and Storage roots are not decorative here. They are the difference between a demo note and a patient-owned medical record with a verifiable seal.",
  },
];

export default function PitchPage() {
  return (
    <main className="min-h-screen bg-bg text-ink">
      <section className="mx-auto grid min-h-screen max-w-7xl gap-10 px-5 py-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:px-8">
        <div className="space-y-8">
          <Link
            href="/"
            className="inline-flex rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted hover:text-ink"
          >
            ScribeZero
          </Link>
          <div className="space-y-5">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
              Zero Cup pitch deck
            </p>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-ink md:text-7xl">
              Your medical record, verifiably private, owned by you.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              ScribeZero is an Indian-language AI health scribe for Tamil and Hindi consults, with
              0G Compute proof and 0G Storage ownership at the center of the workflow.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="rounded-md bg-accent px-5 py-3 text-sm font-bold text-black" href="/app">
              Try the scribe
            </Link>
            <a className="rounded-md border border-line px-5 py-3 text-sm font-bold" href="/demo.mp4">
              Demo video
            </a>
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-line bg-panel">
          <Image
            src="/scribe-zero/onboarding-1.jpg"
            alt="ScribeZero consult preview"
            fill
            sizes="(min-width: 768px) 48vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-px px-5 pb-12 md:grid-cols-3 md:px-8">
        {sections.map((section) => (
          <article key={section.kicker} className="border border-line bg-panel p-6">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">{section.kicker}</p>
            <h2 className="mt-5 text-2xl font-black">{section.title}</h2>
            <p className="mt-4 leading-7 text-muted">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="border-y border-line py-10">
          <h2 className="text-3xl font-black md:text-5xl">Submission proof</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {proofPoints.map((point) => (
              <div key={point} className="rounded-md border border-line bg-panel p-5 text-muted">
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
