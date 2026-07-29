"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Language = "en" | "zh";

type Localized = {
  en: string;
  zh: string;
};

type PortfolioEntry = {
  number: string;
  title: Localized;
  excerpt: Localized;
  href: string;
  meta: Localized;
  sourceType: Localized;
  image: string;
  kind: "deck" | "article";
  imagePosition?: string;
};

const officialOutstandingStudentProof =
  "https://www.polyu.edu.hk/sao/-/media/department/sao/content/srss/scholarships/osa/2023-24/fs_osa_sharing_wang-yidong.pdf?rev=d818a07102884a909ef84694e661e084&hash=ACB92226AB1532239025C9D15C6C093C";

const copy = {
  nav: {
    about: { en: "About", zh: "关于" },
    research: { en: "Research", zh: "研究" },
    publication: { en: "Publication", zh: "论文" },
    honors: { en: "Honors", zh: "荣誉" },
    experience: { en: "Experience", zh: "经历" },
    education: { en: "Education", zh: "教育" },
    usage: { en: "Usage", zh: "用量" },
    contact: { en: "Contact", zh: "联系" },
  },
  hero: {
    titleA: { en: "AI Infrastructure", zh: "AI 基础设施" },
    titleB: { en: "× Markets", zh: "× 资本市场" },
    subtitle: { en: "From grid to GPU to AI experience.", zh: "从电网、GPU 到最终 AI 应用。" },
    explore: { en: "Explore research", zh: "浏览研究" },
    descriptor: { en: "Research portfolio · 2026", zh: "研究作品集 · 2026" },
  },
  research: {
    label: { en: "Selected research", zh: "精选研究" },
    title: { en: "Original work, in its original words.", zh: "原始作品，保留原文。" },
    count: { en: "12 original works", zh: "12 项原创成果" },
  },
  proof: {
    monitored: { en: "HK equities monitored", zh: "港股自动监控" },
    faster: { en: "Faster backtests", zh: "回测效率提升" },
    paper: { en: "Peer-reviewed ACM paper", zh: "ACM 同行评审论文" },
  },
  publication: {
    label: { en: "Peer-reviewed publication", zh: "同行评审论文" },
    title: { en: "Fair Single Index Model", zh: "公平单指数模型" },
    journal: {
      en: "ACM Transactions on Knowledge Discovery from Data · 2024",
      zh: "ACM 数据知识发现汇刊 · 2024",
    },
    abstract: {
      en: "An interpretable single-index framework under equal-opportunity constraints, with theoretical fairness guarantees and evaluation across seven benchmark datasets.",
      zh: "在机会均等约束下构建可解释单指数模型，并给出公平性理论保证，在七个基准数据集上完成验证。",
    },
    doi: { en: "DOI", zh: "DOI" },
    source: { en: "Open source", zh: "开放原文" },
    citation: { en: "BibTeX", zh: "BibTeX" },
  },
  experience: {
    label: { en: "Experience & education", zh: "经历与教育" },
    title: { en: "Research built for decisions.", zh: "让研究服务于决策。" },
    education: { en: "Education", zh: "教育" },
    evidence: { en: "Official evidence", zh: "官方证明" },
  },
  contact: {
    label: { en: "Contact", zh: "联系" },
    title: { en: "Let’s discuss the next constraint.", zh: "一起研究下一个关键约束。" },
    body: {
      en: "AI infrastructure, public markets, quantitative research—and the difficult questions between them.",
      zh: "关于 AI 基础设施、资本市场、量化研究，以及它们交叉处的复杂问题。",
    },
  },
};

const portfolioEntries: PortfolioEntry[] = [
  {
    number: "01",
    title: { en: "Interactive AI Value Chain Loop", zh: "AI 全产业链闭环交互信息图" },
    excerpt: {
      en: "Start from who pays for AI, then trace the demand signal through applications, models, compute infrastructure, semiconductor manufacturing, and finally power and data-center resources.",
      zh: "从“谁为 AI 付费”开始，沿着应用需求、模型服务、算力基础设施、半导体制造、能源和数据中心资源逐层下钻。",
    },
    href: "/research/ai-chain/",
    meta: { en: "Interactive HTML · 2026", zh: "交互式 HTML · 2026" },
    sourceType: { en: "AI VALUE CHAIN", zh: "AI 产业链" },
    image: "/hero-journey/01-grid-campus-v1.jpg",
    kind: "article",
  },
  {
    number: "02",
    title: { en: "AI Infrastructure Knowledge Map", zh: "AI 基建专有知识可视化" },
    excerpt: {
      en: "Think of AI infrastructure as an engineering chain: power enters the site, GPUs and servers turn electricity into compute, cooling removes the heat, and networking connects GPUs into clusters.",
      zh: "把 AI 基建看成一条工程链：电力进来，GPU/服务器把电变成算力，散热系统把热带走，网络把 GPU 连成集群。",
    },
    href: "/research/ai-infrastructure.html",
    meta: { en: "Interactive HTML · 2026", zh: "交互式 HTML · 2026" },
    sourceType: { en: "AI INFRASTRUCTURE", zh: "AI 基础设施" },
    image: "/hero-journey/06-campus-rack-bridge-v2.jpg",
    kind: "article",
  },
  {
    number: "03",
    title: { en: "AI Inference, From First Principles to Business Value", zh: "AI 推理公司深度解析：原理 → 生意 → 价值" },
    excerpt: {
      en: "Fireworks, Together, and Baseten are all solving the same equation: more tokens per second out of the same GPU.",
      zh: "Fireworks · Together · Baseten 三家公司做的事，本质上都是同一道数学题：让同一块 GPU 每秒产出更多 token。",
    },
    href: "/research/ai-inference/",
    meta: { en: "Interactive HTML · 2026", zh: "交互式 HTML · 2026" },
    sourceType: { en: "AI INFERENCE", zh: "AI 推理" },
    image: "/hero-journey/10-chip-app-bridge-v2.jpg",
    kind: "article",
  },
  {
    number: "04",
    title: { en: "GTM Strategy Research: 14 AI Companies", zh: "14 家 AI 公司 GTM 策略研究（合并版）" },
    excerpt: {
      en: "The takeaway up front: GTM for AI companies isn't a question of whether to hire salespeople — it's about matching acquisition and delivery friction to deal size.",
      zh: '结论先行：AI 公司的 GTM 不是"要不要销售"，而是让获客与交付的摩擦匹配客单价。',
    },
    href: "/research/ai-gtm.html",
    meta: { en: "Interactive HTML · Jul 2026", zh: "交互式 HTML · 2026 年 7 月" },
    sourceType: { en: "GO-TO-MARKET", zh: "商业化路径" },
    image: "/hero-journey/05-ai-application-v1.jpg",
    kind: "article",
  },
  {
    number: "05",
    title: { en: "The Companies That Feed AI", zh: "给 AI「喂饭」的三家公司" },
    excerpt: {
      en: "Model capability comes from data — and the most valuable data comes from people.",
      zh: "大模型的能力来自数据，而最贵的数据来自人。",
    },
    href: "/research/ai-data-layer.html",
    meta: { en: "Interactive HTML · 2026", zh: "交互式 HTML · 2026" },
    sourceType: { en: "AI DATA LAYER", zh: "AI 数据层" },
    image: "/research-thumbnails/ai-data-layer.png",
    kind: "article",
  },
  {
    number: "06",
    title: {
      en: "内存市场全景研究：AI 推理与 HBM 驱动的产品、应用与公司格局",
      zh: "内存市场全景研究：AI 推理与 HBM 驱动的产品、应用与公司格局",
    },
    excerpt: {
      en: "内存市场正在从一个“消费电子周期品”变成“AI 基础设施瓶颈资产”。",
      zh: "内存市场正在从一个“消费电子周期品”变成“AI 基础设施瓶颈资产”。",
    },
    href: "/research/memory-hbm/",
    meta: { en: "Source blog · Jun 2026", zh: "原文博客 · 2026 年 6 月" },
    sourceType: { en: "MEMORY & HBM", zh: "内存与 HBM" },
    image: "/hero-journey/04-gpu-package-v1.jpg",
    kind: "article",
  },
  {
    number: "07",
    title: { en: "LLM INFERENCE OPTIMIZATION, ILLUSTRATED", zh: "LLM INFERENCE OPTIMIZATION, ILLUSTRATED" },
    excerpt: {
      en: "The journey of a prompt, and the two families of techniques that make it fast: optimizations built around the KV cache, and optimizations that have nothing to do with it.",
      zh: "The journey of a prompt, and the two families of techniques that make it fast: optimizations built around the KV cache, and optimizations that have nothing to do with it.",
    },
    href: "/research/llm-inference-optimization/",
    meta: { en: "Source blog · Jul 2026", zh: "原文博客 · 2026 年 7 月" },
    sourceType: { en: "LLM INFERENCE", zh: "LLM 推理" },
    image: "/hero-journey/09-tray-gpu-macro-v2.jpg",
    kind: "article",
  },
  {
    number: "08",
    title: { en: "Kimi K3: Architecture, Precision and Hardware Deployment", zh: "Kimi K3: Architecture, Precision and Hardware Deployment" },
    excerpt: {
      en: "How text enters the model → how the model computes → where the data is stored → why low precision saves HBM → why some GPUs or TPUs can run the model more easily than others.",
      zh: "How text enters the model → how the model computes → where the data is stored → why low precision saves HBM → why some GPUs or TPUs can run the model more easily than others.",
    },
    href: "/research/kimi-k3/",
    meta: { en: "Source blog · Jul 2026", zh: "原文博客 · 2026 年 7 月" },
    sourceType: { en: "MODEL × HARDWARE", zh: "模型 × 硬件" },
    image: "/hero-journey/03-compute-tray-v1.jpg",
    kind: "article",
  },
  {
    number: "09",
    title: { en: "The Three Layers of LLM Agents", zh: "The Three Layers of LLM Agents" },
    excerpt: {
      en: "A field guide to what each layer answers — and how they stack, not compete.",
      zh: "A field guide to what each layer answers — and how they stack, not compete.",
    },
    meta: { en: "13-page visual deck", zh: "13 页视觉讲解" },
    href: "/library/llm-agent-three-layers/",
    image: "/readings/llm-agent-three-layers/page-01.avif",
    sourceType: { en: "AGENT ARCHITECTURE", zh: "AGENT 架构" },
    kind: "deck",
  },
  {
    number: "10",
    title: { en: "Agents & Harnesses", zh: "Agents & Harnesses" },
    excerpt: {
      en: "The Layered Architecture, the Recurring Patterns, and What Endures.",
      zh: "The Layered Architecture, the Recurring Patterns, and What Endures.",
    },
    meta: { en: "19-page visual deck", zh: "19 页视觉讲解" },
    href: "/library/agent-harness/",
    image: "/readings/agent-harness/page-01.avif",
    sourceType: { en: "AGENT SYSTEMS", zh: "AGENT 系统" },
    kind: "deck",
  },
  {
    number: "11",
    title: { en: "Sandbox, Docker & Virtual Machines", zh: "Sandbox, Docker & Virtual Machines" },
    excerpt: {
      en: "How they really fit together for AI Agents.",
      zh: "How they really fit together for AI Agents.",
    },
    meta: { en: "11-page visual deck", zh: "11 页视觉讲解" },
    href: "/library/agent-sandbox/",
    image: "/readings/agent-sandbox/page-01.avif",
    sourceType: { en: "SECURE EXECUTION", zh: "安全执行环境" },
    kind: "deck",
  },
  {
    number: "12",
    title: {
      en: "Kimi K3: From Model Architecture and Numerical Precision to Real Hardware Deployment",
      zh: "Kimi K3: From Model Architecture and Numerical Precision to Real Hardware Deployment",
    },
    excerpt: {
      en: "Layered Architecture Relationships · Per-Platform Deployment Cost Estimates · Training Time Projections",
      zh: "Layered Architecture Relationships · Per-Platform Deployment Cost Estimates · Training Time Projections",
    },
    meta: { en: "42-page visual deck", zh: "42 页视觉讲解" },
    href: "/library/kimi-k3-deployment/",
    image: "/readings/kimi-k3-deployment/page-01.avif",
    sourceType: { en: "MODEL × HARDWARE", zh: "模型 × 硬件" },
    kind: "deck",
  },
];

const timeline = [
  {
    period: "2026",
    organization: { en: "China Asset Management (Hong Kong)", zh: "华夏基金（香港）" },
    role: { en: "AI & Equity Research", zh: "AI 与股票研究" },
    detail: {
      en: "Built AI-assisted IPO research, capital-flow dashboards and automated CCASS monitoring across 500+ Hong Kong-listed companies.",
      zh: "搭建 AI 辅助 IPO 研究、资金流仪表板，并自动追踪 500+ 家港股公司的 CCASS 持仓变化。",
    },
  },
  {
    period: "2025",
    organization: { en: "GaoTeng Global Asset Management", zh: "高腾环球资产管理" },
    role: { en: "Quantitative Research · ETFs", zh: "量化研究 · ETF" },
    detail: {
      en: "Redesigned multi-factor research and cross-asset pipelines, reducing backtest runtime by approximately 90%.",
      zh: "重构多因子研究与跨资产数据管线，使回测运行时间降低约 90%。",
    },
  },
  {
    period: "2024—25",
    organization: { en: "Hengli Petrochemical International", zh: "恒力石化国际" },
    role: { en: "Trading Analytics · Crude Oil", zh: "原油交易分析" },
    detail: {
      en: "Integrated shipping, refinery and market data into real-time analytics for physical crude-oil trading decisions.",
      zh: "整合航运、炼厂与市场数据，为实体原油交易构建实时决策分析。",
    },
  },
];

const education = [
  {
    year: "2026",
    school: { en: "National University of Singapore", zh: "新加坡国立大学" },
    degree: { en: "MSc, Financial Engineering · Distinction", zh: "金融工程硕士 · Distinction" },
  },
  {
    year: "2024",
    school: { en: "The Hong Kong Polytechnic University", zh: "香港理工大学" },
    degree: { en: "BSc (Hons), Physics · First Class · Top 5%", zh: "物理学荣誉学士 · 一等荣誉 · 前 5%" },
  },
];

function t(value: Localized, language: Language) {
  return value[language];
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-language");
    if (saved !== "zh" && saved !== "en") return;
    const frame = window.requestAnimationFrame(() => setLanguage(saved));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("portfolio-language", language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  return (
    <main className="academic-site" id="top">
      <header className="academic-header">
        <div className="header-inner">
          <a className="header-brand" href="#top">Eric Wang&apos;s Page</a>
          <nav className="header-nav" aria-label="Primary navigation">
            <a href="#about">{t(copy.nav.about, language)}</a>
            <a href="#publication">{t(copy.nav.publication, language)}</a>
            <a href="#research">{t(copy.nav.research, language)}</a>
            <a href="#honors">{t(copy.nav.honors, language)}</a>
            <a href="#experience">{t(copy.nav.experience, language)}</a>
            <a href="#education">{t(copy.nav.education, language)}</a>
            <a href="/codex-usage/">{t(copy.nav.usage, language)}</a>
          </nav>
          <button
            className="plain-language-toggle"
            type="button"
            onClick={() => setLanguage((current) => (current === "en" ? "zh" : "en"))}
            aria-label={language === "en" ? "切换至中文" : "Switch to English"}
          >
            {language === "en" ? "中文" : "EN"}
          </button>
        </div>
      </header>

      <div className="academic-layout">
        <aside className="profile-sidebar" aria-label="Profile">
          <Image
            className="profile-avatar"
            src="/eric.png"
            alt="Eric Wang"
            width={538}
            height={720}
            priority
          />
          <h1>Eric Wang</h1>
          <p className="profile-tagline">
            {language === "en" ? "AI Infrastructure × Markets" : "AI 基础设施 × 资本市场"}
          </p>
          <p className="profile-quote">
            {language === "en" ? "From silicon to systems to signals." : "从芯片、系统到市场信号。"}
          </p>
          <ul className="profile-facts">
            <li><span aria-hidden="true">●</span> Hong Kong / Singapore</li>
            <li><span aria-hidden="true">◆</span> AI &amp; Equity Research</li>
          </ul>
          <nav className="profile-links" aria-label="Profile links">
            <a href="mailto:wangyidong020321@gmail.com">Email</a>
            <a href="https://www.linkedin.com/in/eric-wangyidong/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://github.com/ericwang0321" target="_blank" rel="noreferrer">GitHub</a>
            <a href="/codex-usage/">Codex Usage</a>
          </nav>
        </aside>

        <div className="academic-content">
          <section id="about" className="content-section">
            <h2>{language === "en" ? "About Me" : "关于我"}</h2>
            {language === "en" ? (
              <>
                <p>
                  Hi, I am <strong>Eric Wang</strong>. I work at the intersection of
                  <strong> AI infrastructure</strong>, <strong>public markets</strong>, and quantitative research.
                  My work follows the AI value chain from power and silicon to systems, applications, and market signals.
                </p>
                <p>My current research interests include:</p>
                <ul>
                  <li>AI compute, memory, networking, power, and cooling supply chains</li>
                  <li>Inference economics, agent systems, and model deployment</li>
                  <li>Data-driven equity research and market-monitoring systems</li>
                </ul>
              </>
            ) : (
              <>
                <p>
                  你好，我是 <strong>Eric Wang</strong>。我的研究聚焦于
                  <strong> AI 基础设施</strong>、<strong>资本市场</strong>与量化研究的交叉领域，
                  沿着电力、芯片、系统、应用到市场信号研究完整的 AI 产业链。
                </p>
                <p>目前主要关注：</p>
                <ul>
                  <li>AI 算力、内存、网络、电力与液冷产业链</li>
                  <li>推理经济性、Agent 系统与模型部署</li>
                  <li>数据驱动的股票研究与市场监控系统</li>
                </ul>
              </>
            )}
          </section>

          <section id="publication" className="content-section">
            <h2>{language === "en" ? "Publication" : "论文"}</h2>
            <div className="publication-feature">
              <figure className="publication-figure">
                <Image
                  src="/papers/fair-single-index-model-figure-1.jpg"
                  alt="Fairness-accuracy tradeoffs for FSIM and baseline models on the Arrhythmia and Compas datasets"
                  width={398}
                  height={500}
                  sizes="(max-width: 720px) calc(100vw - 36px), 250px"
                />
                <figcaption>
                  {language === "en"
                    ? "Figure 1 · Fairness-accuracy tradeoffs on Arrhythmia and Compas."
                    : "图 1 · Arrhythmia 与 Compas 数据集上的公平性—准确率权衡。"}
                </figcaption>
              </figure>
              <article className="publication-entry">
                <h3>
                  <a href="https://doi.org/10.1145/3690646" target="_blank" rel="noreferrer">
                    Fair Single Index Model
                  </a>
                </h3>
                <p><strong>Yidong Wang</strong>, Meng Ding, Jinhui Xu, Di Wang</p>
                <p><em>ACM Transactions on Knowledge Discovery from Data</em>, 2024.</p>
                <ul>
                  <li>{t(copy.publication.abstract, language)}</li>
                </ul>
                <div className="inline-links">
                  <a href="https://doi.org/10.1145/3690646" target="_blank" rel="noreferrer">DOI</a>
                  <a href="https://repository.kaust.edu.sa/items/9b87637c-4279-4a0c-a64f-0d29b5acc2c1" target="_blank" rel="noreferrer">KAUST</a>
                  <a href="/papers/fair-single-index-model.bib" download>BibTeX</a>
                </div>
              </article>
            </div>
          </section>

          <section id="research" className="content-section">
            <div className="simple-section-heading">
              <h2>{language === "en" ? "Selected Research" : "精选研究"}</h2>
              <span>{portfolioEntries.length} {language === "en" ? "works" : "项成果"}</span>
            </div>
            <div className="research-list">
              {portfolioEntries.map((item) => (
                <article className="research-row" key={item.number}>
                  <a className="research-thumbnail" href={item.href} tabIndex={-1} aria-hidden="true">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="(max-width: 720px) calc(100vw - 40px), 210px"
                      style={{ objectPosition: item.imagePosition ?? "center" }}
                    />
                  </a>
                  <div className="research-copy">
                    <p className="research-meta">{t(item.sourceType, language)} · {t(item.meta, language)}</p>
                    <h3><a href={item.href}>{t(item.title, language)}</a></h3>
                    <p>{t(item.excerpt, language)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="honors" className="content-section">
            <h2>{language === "en" ? "Honors and Awards" : "荣誉与奖项"}</h2>
            <ul className="dated-list">
              <li>
                <time>2023</time>
                <span>
                  Faculty Outstanding Student, The Hong Kong Polytechnic University ·{" "}
                  <a href={officialOutstandingStudentProof} target="_blank" rel="noreferrer">
                    {t(copy.experience.evidence, language)}
                  </a>
                </span>
              </li>
            </ul>
          </section>

          <section id="experience" className="content-section">
            <h2>{language === "en" ? "Experience" : "经历"}</h2>
            <div className="plain-timeline">
              {timeline.map((item) => (
                <article key={`${item.period}-${item.organization.en}`}>
                  <time>{item.period}</time>
                  <div>
                    <h3>{t(item.organization, language)}</h3>
                    <p><strong>{t(item.role, language)}</strong></p>
                    <p>{t(item.detail, language)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="education" className="content-section">
            <h2>{language === "en" ? "Education" : "教育"}</h2>
            <div className="plain-timeline">
              {education.map((item) => (
                <article key={item.school.en}>
                  <time>{item.year}</time>
                  <div>
                    <h3>{t(item.school, language)}</h3>
                    <p>{t(item.degree, language)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      <footer className="academic-footer">
        <p>© {new Date().getFullYear()} Eric Wang · Hong Kong / Singapore</p>
        <a href="#top">{language === "en" ? "Back to top" : "返回顶部"} ↑</a>
      </footer>
    </main>
  );
}
