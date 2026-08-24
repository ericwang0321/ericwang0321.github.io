import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Eric Wang — An AI Journey",
  description: "How Eric Wang moved from physics and machine-learning research to AI tools, infrastructure and markets.",
  alternates: { canonical: "/about/" },
};

export default function AboutLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
