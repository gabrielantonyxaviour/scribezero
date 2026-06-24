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
  ["Compute", "Note generation is designed around a neutral 0G Compute execution layer."],
  ["Storage", "Each sealed record receives a portable 0G Storage ownership handle."],
  ["Privacy", "Verification proves the receipt without exposing patient data."],
];

function Slide({
  eyebrow,
  number,
  children,
  className = "",
}: {
  eyebrow: string;
  number: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`grid min-h-screen place-items-center px-4 py-10 ${className}`}>
      <div className="relative min-h-[720px] w-full max-w-7xl overflow-hidden rounded-[10px] border border-line bg-[#f6fbf7] shadow-2xl shadow-emerald-950/15 md:aspect-video md:min-h-0">
        <div className="absolute left-8 top-7 z-10 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.24em] text-emerald-900/55">
          <span>{number}</span>
          <span className="h-px w-14 bg-emerald-900/25" />
          <span>{eyebrow}</span>
        </div>
        {children}
      </div>
    </section>
  );
}

export default function PitchPage() {
  return (
    <main className="min-h-screen snap-y snap-mandatory overflow-x-hidden bg-[#dfeee4] text-[#102118]">
      <Slide eyebrow="Patient-owned medical memory" number="01">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(50,185,123,0.28),transparent_28%),linear-gradient(120deg,#f8fff9_0%,#e6f4eb_56%,#c8dfd0_100%)]" />
        <div className="absolute right-0 top-0 h-full w-[43%] overflow-hidden border-l border-emerald-900/10">
          <Image src="/scribe-zero/onboarding-1.jpg" alt="ScribeZero clinical consult" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#f8fff9]/20" />
        </div>
        <div className="absolute left-6 right-6 top-24 max-w-3xl md:left-16 md:right-auto md:top-28">
          <Link href="/" className="font-mono text-xs uppercase tracking-[0.28em] text-emerald-800">
            ScribeZero
          </Link>
          <h1 className="mt-8 text-[44px] font-black leading-[0.92] tracking-tight md:text-[86px] md:leading-[0.88]">
            Spoken care becomes patient-owned proof.
          </h1>
          <p className="mt-8 max-w-2xl text-[26px] leading-[1.35] text-emerald-950/70">
            A bilingual AI health scribe for Tamil and Hindi consults, built around private 0G receipts instead of trapped PDFs.
          </p>
        </div>
        <div className="absolute bottom-12 left-16 flex gap-3">
          <Link href="/app" className="rounded-md bg-emerald-700 px-5 py-3 text-sm font-black text-white">
            Open live scribe
          </Link>
          <a href="/demo.mp4" className="rounded-md border border-emerald-900/20 px-5 py-3 text-sm font-black">
            Watch demo video
          </a>
        </div>
      </Slide>

      <Slide eyebrow="The problem" number="02">
        <div className="absolute inset-0 bg-[#fffaf0]" />
        <div className="absolute left-16 top-28 w-[46%]">
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-rose-800">Care speaks local. Records do not.</p>
          <h2 className="mt-8 text-[72px] font-black leading-[0.92]">Medical AI cannot start by erasing the language of the room.</h2>
        </div>
        <div className="absolute right-16 top-28 grid w-[42%] gap-5">
          {[
            "Doctors and patients speak naturally in Tamil or Hindi.",
            "Clinical systems force the outcome into English forms.",
            "Patients leave without a portable, verifiable record.",
          ].map((item, index) => (
            <div key={item} className="border-l-4 border-rose-700 bg-white p-7 shadow-lg shadow-rose-950/5">
              <p className="font-mono text-sm text-rose-800">0{index + 1}</p>
              <p className="mt-3 text-[30px] font-black leading-tight">{item}</p>
            </div>
          ))}
        </div>
      </Slide>

      <Slide eyebrow="Product loop" number="03">
        <div className="absolute inset-0 bg-[#102118]" />
        <h2 className="absolute left-16 top-28 max-w-4xl text-[78px] font-black leading-[0.9] text-white">
          Four steps from consult to sealed health memory.
        </h2>
        <div className="absolute bottom-16 left-16 right-16 grid grid-cols-4 gap-4">
          {flow.map(([num, title, text]) => (
            <article key={num} className="min-h-[330px] border border-emerald-300/20 bg-white/[0.07] p-7 text-white">
              <p className="text-[72px] font-black text-emerald-300">{num}</p>
              <h3 className="mt-6 text-[34px] font-black">{title}</h3>
              <p className="mt-4 text-[21px] leading-[1.35] text-white/68">{text}</p>
            </article>
          ))}
        </div>
      </Slide>

      <Slide eyebrow="Why 0G is load-bearing" number="04">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#06130d,#173825)]" />
        <h2 className="absolute left-16 top-28 max-w-3xl text-[74px] font-black leading-[0.92] text-white">
          Remove 0G and this becomes just another note app.
        </h2>
        <div className="absolute right-16 top-28 grid w-[42%] gap-5">
          {proof.map(([label, text]) => (
            <div key={label} className="rounded-md border border-emerald-300/25 bg-emerald-50 p-7">
              <p className="font-mono text-sm uppercase tracking-[0.24em] text-emerald-800">{label}</p>
              <p className="mt-4 text-[28px] font-black leading-tight text-[#102118]">{text}</p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-16 left-16 flex items-center gap-5 font-mono text-sm uppercase tracking-[0.2em] text-emerald-200">
          <span>Consult</span>
          <span className="h-px w-28 bg-emerald-300/40" />
          <span>SOAP note</span>
          <span className="h-px w-28 bg-emerald-300/40" />
          <span>0G receipt</span>
          <span className="h-px w-28 bg-emerald-300/40" />
          <span>Private verify</span>
        </div>
      </Slide>

      <Slide eyebrow="Demo video slots" number="05">
        <div className="absolute inset-0 bg-[#f4f1e8]" />
        <h2 className="absolute left-16 top-28 text-[68px] font-black leading-[0.92]">What the final demo will show.</h2>
        <div className="absolute bottom-16 left-16 right-16 grid grid-cols-3 gap-5">
          {[
            ["Clip 01", "/app consult to SOAP note", "Record the sample consult, generate the note, pause on structured output."],
            ["Clip 02", "Receipt verification", "Open a sealed record and show the 0G proof fields without private content."],
            ["Clip 03", "Pitch proof scroll", "Show the judge verification slide and final CTA."],
          ].map(([label, title, text]) => (
            <article key={label} className="min-h-[360px] border border-emerald-950/15 bg-white p-7 shadow-xl shadow-emerald-950/10">
              <p className="font-mono text-sm uppercase tracking-[0.24em] text-emerald-700">{label}</p>
              <h3 className="mt-7 text-[34px] font-black leading-tight">{title}</h3>
              <p className="mt-5 text-[22px] leading-[1.35] text-emerald-950/65">{text}</p>
              <div className="mt-8 h-24 rounded-md border border-dashed border-emerald-800/35 bg-emerald-50" />
            </article>
          ))}
        </div>
      </Slide>

      <Slide eyebrow="Judge close" number="06">
        <div className="absolute inset-0 bg-[#07140d]" />
        <div className="absolute left-16 top-28 max-w-4xl">
          <h2 className="text-[86px] font-black leading-[0.88] text-white">
            The winning point: useful AI with patient-owned proof.
          </h2>
          <p className="mt-8 max-w-3xl text-[28px] leading-[1.35] text-white/68">
            ScribeZero is not pitching a prettier note. It is pitching the health-record primitive for private, multilingual AI care.
          </p>
        </div>
        <div className="absolute bottom-16 left-16 flex gap-4">
          <Link href="/app" className="rounded-md bg-emerald-300 px-6 py-4 text-sm font-black text-black">
            Try ScribeZero
          </Link>
          <a href="/demo.mp4" className="rounded-md border border-white/20 px-6 py-4 text-sm font-black text-white">
            View /demo.mp4
          </a>
        </div>
        <p className="absolute bottom-16 right-16 font-mono text-sm uppercase tracking-[0.26em] text-emerald-300">
          Zero Cup / Apache-2.0
        </p>
      </Slide>
    </main>
  );
}
