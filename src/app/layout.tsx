import type { Metadata } from "next";
import { Domine, Source_Serif_4, Libre_Franklin, Tiro_Bangla } from "next/font/google";
import "./globals.css";
import { SITE_NAME } from "@/lib/site";

const domine = Domine({
  variable: "--font-domine",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Tiro Bangla only ships one weight (regular) — used for machine-translated
// Bangla text on article pages, applied conditionally in article-translate.tsx.
const tiroBangla = Tiro_Bangla({
  variable: "--font-tiro-bangla",
  subsets: ["bengali"],
  weight: "400",
  style: ["normal", "italic"],
});

const title = SITE_NAME;
const description = "Independent daily reporting and analysis.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BETTER_AUTH_URL || "http://localhost:3000"),
  title: {
    default: title,
    template: `%s — ${title}`,
  },
  description,
  alternates: {
    types: { "application/rss+xml": "/rss.xml" },
  },
  openGraph: {
    title,
    description,
    siteName: title,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${domine.variable} ${sourceSerif.variable} ${libreFranklin.variable} ${tiroBangla.variable}`}
    >
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
