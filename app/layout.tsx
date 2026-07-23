import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ericwang0321.github.io"),
  title: "Eric Wang — AI & Capital Markets Research",
  description:
    "Eric Wang researches AI infrastructure, technology value chains and public markets, combining financial engineering with applied AI systems.",
  keywords: [
    "Eric Wang",
    "Yidong Wang",
    "AI infrastructure",
    "AI value chain",
    "capital markets",
    "equity research",
    "financial engineering",
  ],
  authors: [{ name: "Eric Wang" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Eric Wang — AI & Capital Markets Research",
    description: "Researching the infrastructure of intelligence.",
    type: "website",
    url: "/",
    siteName: "Eric Wang",
    images: [{ url: "/og-light.png", width: 1536, height: 1024, alt: "Eric Wang — AI and Capital Markets Research" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eric Wang — AI & Capital Markets Research",
    description: "Researching the infrastructure of intelligence.",
    images: ["/og-light.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
