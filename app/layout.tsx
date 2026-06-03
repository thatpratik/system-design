import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Header } from "@/components/layout/header";
import { SearchCommand } from "@/components/shared/search-command";
import { buildSearchIndex } from "@/lib/content";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "System Design",
    template: "%s | System Design",
  },
  description:
    "Interactive system design learning platform — visualize systems and their underlying components.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchIndex = buildSearchIndex();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <Header />
        <SearchCommand entries={searchIndex} />
        <main>{children}</main>
      </body>
    </html>
  );
}
