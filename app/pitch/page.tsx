import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const flow = [
  ["01", "Listen", "Tamil or Hindi consult stays natural."],
  ["02", "Structure", "AI turns speech into a clinical SOAP note."],
  ["03", "Seal", "0G creates a private ownership receipt."],
  ["04", "Verify", "Integrity is public; medical content stays private."],
];

const proof = [
  ["0G Compute", "Note generation is framed as neutral execution, not a black-box clinic plugin."],
  ["0G Storage", "Each sealed record receives a portable ownership handle for the patient."],
  ["Privacy", "The receipt can be verified without exposing the protected medical content."],
];

function Slide({
  eyebrow,
  number,
  children,
}: {
  eyebrow: string;
  number: string;
  children: ReactNode;
}) {
  return (
    <section className="grid min-h-screen snap-start place-items-center px-4 py-10">
      <div className="relative min-h-[720px] w-full max-w-7xl overflow-hidden rounded-lg border border-[#f5efe2]/10 bg-[#0e0f0d] shadow-2xl shadow-black/50 md:aspect-video md:min-h-0">
        <div className="absolute left-8 top-7 z-10 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.24em] text-[#a9a89e]">
          <span>{number}</span>
          <span className="h-px w-14 bg-[#84c4a0]/45" />
          <span>{eyebrow}</span>
        </div>
        {children}
      </div>
    </section>
  );
}

export default function PitchPage() {
  return (
    <main className="min-h-screen snap-y snap-mandatory overflow-x-hidden bg-[#0e0f0d] text-[#f5efe2]">
      <Slide eyebrow="Patient-owned medical memory" number="01">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(132,196,160,0.2),transparent_28%),linear-gradient(120deg,#0e0f0d_0%,#161815_58%,#1e211d_100%)]" />
        <div className="absolute right-0 top-0 h-full w-[43%] overflow-hidden border-l border-[#f5efe2]/10">
          <Image src="/scribe-zero/onboarding-1.jpg" alt="ScribeZero clinical consult" fill priority className="object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0e0f0d]/85" />
        </div>
        <div className="absolute left-6 right-6 top-24 max-w-3xl md:left-16 md:right-auto md:top-28">
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.28em] text-[#84c4a0]">
            ScribeZero
          </Link>
          <h1 className="mt-8 text-[44px] font-semibold leading-[0.96] tracking-tight md:text-[82px] md:leading-[0.9]">
            Spoken care becomes patient-owned proof.
          </h1>
          <p className="mt-8 max-w-2xl text-[25px] leading-[1.35] text-[#a9a89e]">
            A bilingual AI health scribe for Tamil and Hindi consults, built around private 0G receipts instead of trapped PDFs.
          </p>
        </div>
        <div className="absolute bottom-12 left-16 flex gap-3">
          <Link href="/app" className="rounded-md bg-[#84c4a0] px-5 py-3 text-sm font-black text-[#0e0f0d]">
            Open live scribe
          </Link>
          <a href="/demo.mp4" className="rounded-md border border-[#f5efe2]/15 bg-[#161815]/80 px-5 py-3 text-sm font-black">
            Watch demo video
          </a>
        </div>
      </Slide>

      <Slide eyebrow="The problem" number="02">
        <div className="absolute inset-0 bg-[#161815]" />
        <div className="absolute left-16 top-28 w-[46%]">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-[#d6573f]">Care speaks local. Records do not.</p>
          <h2 className="mt-8 text-[70px] font-semibold leading-[0.94]">Medical AI cannot erase the language of the room.</h2>
        </div>
        <div className="absolute right-16 top-28 grid w-[42%] gap-5">
          {[
            "Doctors and patients speak naturally in Tamil or Hindi.",
            "Clinical systems force the outcome into English forms.",
            "Patients leave without a portable, verifiable record.",
          ].map((item, index) => (
            <div key={item} className="border-l-4 border-[#d6573f] bg-[#0e0f0d] p-7 shadow-xl shadow-black/20">
              <p className="font-mono text-sm text-[#d6573f]">0{index + 1}</p>
              <p className="mt-3 text-[30px] font-semibold leading-tight">{item}</p>
            </div>
          ))}
        </div>
      </Slide>

      <Slide eyebrow="Product loop" number="03">
        <div className="absolute inset-0 bg-[#0e0f0d]" />
        <h2 className="absolute left-16 top-28 max-w-4xl text-[76px] font-semibold leading-[0.92]">
          Four steps from consult to sealed health memory.
        </h2>
        <div className="absolute bottom-16 left-16 right-16 grid grid-cols-4 gap-4">
          {flow.map(([num, title, text]) => (
            <article key={num} className="min-h-[330px] border border-[#f5efe2]/10 bg-[#161815] p-7">
              <p className="text-[70px] font-semibold text-[#84c4a0]">{num}</p>
              <h3 className="mt-6 text-[33px] font-semibold">{title}</h3>
              <p className="mt-4 text-[21px] leading-[1.35] text-[#a9a89e]">{text}</p>
            </article>
          ))}
        </div>
      </Slide>

      <Slide eyebrow="Why 0G is load-bearing" number="04">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0e0f0d,#1e211d)]" />
        <h2 className="absolute left-16 top-28 max-w-3xl text-[72px] font-semibold leading-[0.94]">
          Remove 0G and this becomes just another note app.
        </h2>
        <div className="absolute right-16 top-28 grid w-[42%] gap-5">
          {proof.map(([label, text]) => (
            <div key={label} className="rounded-md border border-[#84c4a0]/25 bg-[#161815] p-7">
              <p className="font-mono text-sm uppercase tracking-[0.24em] text-[#84c4a0]">{label}</p>
              <p className="mt-4 text-[27px] font-semibold leading-tight">{text}</p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-16 left-16 flex items-center gap-5 font-mono text-sm uppercase tracking-[0.2em] text-[#84c4a0]">
          <span>Consult</span>
          <span className="h-px w-28 bg-[#84c4a0]/40" />
          <span>SOAP note</span>
          <span className="h-px w-28 bg-[#84c4a0]/40" />
          <span>0G receipt</span>
          <span className="h-px w-28 bg-[#84c4a0]/40" />
          <span>Private verify</span>
        </div>
      </Slide>

      <Slide eyebrow="Demo video slots" number="05">
        <div className="absolute inset-0 bg-[#161815]" />
        <h2 className="absolute left-16 top-28 text-[66px] font-semibold leading-[0.94]">What the final demo shows.</h2>
        <div className="absolute bottom-16 left-16 right-16 grid grid-cols-3 gap-5">
          {[
            ["Clip 01", "/app consult to SOAP note", "Record the sample consult, generate the note, pause on structured output."],
            ["Clip 02", "Receipt verification", "Open a sealed record and show the 0G proof fields without private content."],
            ["Clip 03", "Pitch proof scroll", "Show the judge verification slide and final CTA."],
          ].map(([label, title, text]) => (
            <article key={label} className="min-h-[360px] border border-[#f5efe2]/10 bg-[#0e0f0d] p-7 shadow-xl shadow-black/20">
              <p className="font-mono text-sm uppercase tracking-[0.24em] text-[#84c4a0]">{label}</p>
              <h3 className="mt-7 text-[33px] font-semibold leading-tight">{title}</h3>
              <p className="mt-5 text-[22px] leading-[1.35] text-[#a9a89e]">{text}</p>
              <div className="mt-8 h-24 rounded-md border border-dashed border-[#84c4a0]/35 bg-[#84c4a0]/10" />
            </article>
          ))}
        </div>
      </Slide>

      <Slide eyebrow="Judge close" number="06">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(132,196,160,0.22),transparent_28%),#0e0f0d]" />
        <div className="absolute left-16 top-28 max-w-4xl">
          <h2 className="text-[84px] font-semibold leading-[0.9]">
            Useful AI with patient-owned proof.
          </h2>
          <p className="mt-8 max-w-3xl text-[28px] leading-[1.35] text-[#a9a89e]">
            ScribeZero is not pitching a prettier note. It is pitching the health-record primitive for private, multilingual AI care.
          </p>
        </div>
        <div className="absolute bottom-16 left-16 flex gap-4">
          <Link href="/app" className="rounded-md bg-[#84c4a0] px-6 py-4 text-sm font-black text-[#0e0f0d]">
            Try ScribeZero
          </Link>
          <a href="/demo.mp4" className="rounded-md border border-[#f5efe2]/15 bg-[#161815] px-6 py-4 text-sm font-black">
            View /demo.mp4
          </a>
        </div>
        <p className="absolute bottom-16 right-16 font-mono text-sm uppercase tracking-[0.26em] text-[#84c4a0]">
          Zero Cup / Apache-2.0
        </p>
      </Slide>
    </main>
  );
}
