import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScribeZero — your medical record, verifiably private, owned by you",
  description:
    "Speak Tamil or Hindi. Get a structured clinical note generated inside 0G Compute (TeeTLS) and owned by you on 0G Storage — verifiable by anyone, readable by no one but you.",
  metadataBase: new URL("https://scribezero.app"),
  openGraph: {
    title: "ScribeZero — verifiable Indian-language health scribe",
    description:
      "Speak your language. Own your record. Inference via 0G Compute TeeTLS, records on 0G Storage.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${mono.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink flex flex-col">
        <WalletProvider>
          <TooltipProvider delayDuration={150}>
            <LenisProvider>{children}</LenisProvider>
          </TooltipProvider>
          <Toaster position="bottom-right" />
        </WalletProvider>
      </body>
    </html>
  );
}
