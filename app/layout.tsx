import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { PrivyProvider } from "@/components/providers/privy-provider";

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

export const metadata: Metadata = {
  title: "ScribeZero — your medical record, verifiably private, owned by you",
  description:
    "Speak Tamil or Hindi. Get a structured clinical note owned by you on 0G Storage, with 0G Compute TEE proof shown when the provider is available.",
  metadataBase: new URL("https://scribezero.app"),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/brand/scribe-zero-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/scribe-zero-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "192x192", type: "image/png" }],
  },
  openGraph: {
    title: "ScribeZero — verifiable Indian-language health scribe",
    description:
      "Speak your language. Own your record on 0G Storage, with Compute proof status shown honestly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink flex flex-col">
        <PrivyProvider>
          <WalletProvider>
            <TooltipProvider delayDuration={150}>
              <LenisProvider>{children}</LenisProvider>
            </TooltipProvider>
            <Toaster position="bottom-right" />
          </WalletProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
