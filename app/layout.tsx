import type { Metadata } from "next";
import { Geist_Mono, Source_Sans_3 } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Resume Studio — ATS-friendly resumes for real job hunts",
    template: "%s",
  },
  description:
    "Build multiple ATS-optimized resume versions, tailor them fast, and export clean PDFs that recruiters and parsers can actually read.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delay={200}>{children}</TooltipProvider>
        <Toaster richColors closeButton position="bottom-right" />
      </body>
    </html>
  );
}
