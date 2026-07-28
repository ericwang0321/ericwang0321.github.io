import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import SourceArticle from "../components/SourceArticle";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Kimi K3: Architecture, Precision and Hardware Deployment — Eric Wang",
  description:
    "Kimi K3 architecture, numerical precision, memory capacity, parallelism and hardware deployment.",
  openGraph: {
    title: "Kimi K3: Architecture, Precision and Hardware Deployment",
    description: "From the end-to-end data path to real hardware deployment.",
    images: [{ url: "/research/kimi-k3/media/image1.png" }],
  },
};

const toc = [
  { number: "00", label: "End-to-end data path", href: "#start-with-the-end-to-end-data-path" },
  { number: "I", label: "Units and capacity", href: "#part-i-fundamental-units-bit-byte-gb-gib-and-tb" },
  { number: "II", label: "Weight, activation and HBM", href: "#part-ii-what-are-weight-activation-and-hbm" },
  { number: "III", label: "Numerical precision", href: "#part-iii-what-does-precision-mean" },
  { number: "IV", label: "Operators and engines", href: "#part-iv-operators-kernels-and-inference-engines" },
  { number: "V", label: "Kimi K3 architecture", href: "#part-v-kimi-k3s-four-core-architectural-components" },
  { number: "VI", label: "Multi-accelerator execution", href: "#part-vi-how-multiple-accelerators-run-kimi-k3-together" },
  { number: "VII", label: "Hardware and economics", href: "#part-vii-one-unified-scenario-for-inference-and-training-hardware" },
];

export default async function KimiK3Article() {
  const articleHtml = await readFile(path.join(process.cwd(), "content/kimi-k3.html"), "utf8");

  return (
    <SourceArticle
      title="Kimi K3: Architecture, Precision and Hardware Deployment"
      subtitle="How text enters the model → how the model computes → where the data is stored → why low precision saves HBM → why some GPUs or TPUs can run the model more easily than others."
      kicker="MODEL ARCHITECTURE × AI HARDWARE · 2026"
      articleHtml={articleHtml}
      toc={toc}
      deckHref="/library/kimi-k3-deployment/"
    />
  );
}
