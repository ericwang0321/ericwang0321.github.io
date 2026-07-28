import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import SourceArticle from "../components/SourceArticle";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "内存市场全景研究：AI 推理与 HBM 驱动的产品、应用与公司格局 — Eric Wang",
  description: "AI 推理与 HBM 驱动的内存产品、应用、市场规模、公司格局和服务器 BOM 研究。",
  openGraph: {
    title: "内存市场全景研究",
    description: "AI 推理与 HBM 驱动的产品、应用与公司格局。",
    images: [{ url: "/research/memory-hbm/assets/source_figures/S01_p018_global_memory_market_size.png" }],
  },
};

const toc = [
  { number: "01", label: "核心结论", href: "#1-核心结论" },
  { number: "02", label: "产品 × 应用 × 公司", href: "#2-内存用在哪里产品-x-应用-x-公司模型" },
  { number: "03", label: "TAM 与预测口径", href: "#3-tam-与预测不要混同四种口径" },
  { number: "04", label: "本轮周期变化", href: "#4-为什么这一轮不只是周期涨价" },
  { number: "05", label: "公司格局与营收", href: "#5-公司格局谁占多少" },
  { number: "06", label: "服务器 BOM", href: "#7-服务器-bom为什么内存变成系统约束" },
  { number: "07", label: "产业含义与风险", href: "#8-投资和产业含义" },
];

export default async function MemoryHbmArticle() {
  const articleHtml = await readFile(path.join(process.cwd(), "content/memory-hbm.html"), "utf8");

  return (
    <SourceArticle
      title="内存市场全景研究：AI 推理与 HBM 驱动的产品、应用与公司格局"
      kicker="MEMORY MARKET RESEARCH · 2026"
      articleHtml={articleHtml}
      toc={toc}
    />
  );
}
