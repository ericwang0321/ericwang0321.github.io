import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import SourceArticle from "../components/SourceArticle";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "LLM Inference Optimization, Illustrated — Eric Wang",
  description:
    "The journey of a prompt, and the two families of techniques that make it fast: optimizations built around the KV cache, and optimizations that have nothing to do with it.",
  openGraph: {
    title: "LLM Inference Optimization, Illustrated",
    description: "The journey of a prompt, from prefill and decode to the serving techniques that make it fast.",
    images: [{ url: "/research/llm-inference-optimization/media/image1.png" }],
  },
};

const toc = [
  { number: "00", label: "Executive Summary", href: "#executive-summary" },
  { number: "I", label: "The Journey of a Prompt", href: "#part-i-foundations-the-journey-of-a-prompt" },
  { number: "II", label: "KV-Cache Techniques", href: "#part-ii-family-one-techniques-that-optimize-the-kv-cache" },
  { number: "III", label: "Other Optimizations", href: "#part-iii-family-two-techniques-unrelated-to-the-kv-cache" },
  { number: "IV", label: "One-Page Cheat Sheet", href: "#part-iv-wrap-up-the-one-page-cheat-sheet" },
];

export default async function LlmInferenceOptimizationArticle() {
  const articleHtml = await readFile(path.join(process.cwd(), "content/llm-inference-optimization.html"), "utf8");

  return (
    <SourceArticle
      title="LLM Inference Optimization, Illustrated"
      subtitle="The journey of a prompt, and the two families of techniques that make it fast: optimizations built around the KV cache, and optimizations that have nothing to do with it"
      kicker="LLM INFERENCE · ORIGINAL REPORT"
      sourceNote={'A plain-language report adaptation of the internal tech talk "LLM Inference: The Journey of a Prompt" (30 slides)'}
      metadata="July 13, 2026 · Companion deck: LLM_Inference_Optimization_EN.pptx"
      articleHtml={articleHtml}
      toc={toc}
    />
  );
}
