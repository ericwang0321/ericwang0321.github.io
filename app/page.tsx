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
    research: { en: "Research", zh: "研究" },
    publication: { en: "Publication", zh: "论文" },
    experience: { en: "Experience", zh: "经历" },
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
    authors: { en: "Yidong Wang · Meng Ding · Jinhui Xu · Di Wang", zh: "王逸东 · 丁萌 · 徐金辉 · 王迪" },
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

const proofPoints = [
  { value: "500+", label: copy.proof.monitored },
  { value: "~90%", label: copy.proof.faster },
  { value: "1", label: copy.proof.paper },
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
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      }),
      { threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Eric Wang home">
          <strong>EW</strong>
          <span>Eric Wang</span>
        </a>

        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span /><span />
          <b>{menuOpen ? "Close" : "Menu"}</b>
        </button>

        <nav id="site-navigation" className={menuOpen ? "nav-links is-open" : "nav-links"} aria-label="Primary navigation">
          <a href="#research" onClick={() => setMenuOpen(false)}>{t(copy.nav.research, language)}</a>
          <a href="#publication" onClick={() => setMenuOpen(false)}>{t(copy.nav.publication, language)}</a>
          <a href="#experience" onClick={() => setMenuOpen(false)}>{t(copy.nav.experience, language)}</a>
          <a href="/codex-usage/" onClick={() => setMenuOpen(false)}>{t(copy.nav.usage, language)}</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>{t(copy.nav.contact, language)}</a>
        </nav>

        <button
          className="language-toggle"
          type="button"
          onClick={() => setLanguage((current) => (current === "en" ? "zh" : "en"))}
          aria-label={language === "en" ? "切换至中文" : "Switch to English"}
        >
          <span className={language === "en" ? "active" : ""}>EN</span>
          <i />
          <span className={language === "zh" ? "active" : ""}>中</span>
        </button>
      </header>

      <section id="top" className="hero-section">
        <div className="hero-sticky">
          <div className="hero-system-map" aria-hidden="true">
            <span><i>01</i> GRID + POWER</span>
            <span><i>02</i> COMPUTE</span>
            <span><i>03</i> MEMORY + NETWORK</span>
            <span><i>04</i> AI APPLICATIONS</span>
            <span><i>05</i> MARKETS</span>
          </div>
          <div className="hero-copy">
            <p className="hero-name">Eric Wang <span>王逸东</span></p>
            <h1>
              <span>{t(copy.hero.titleA, language)}</span>
              <span className="hero-accent">{t(copy.hero.titleB, language)}</span>
            </h1>
            <p className="hero-subtitle">{t(copy.hero.subtitle, language)}</p>
            <a className="primary-link" href="#research">
              {t(copy.hero.explore, language)} <span>↘</span>
            </a>
            <small>{t(copy.hero.descriptor, language)}</small>
          </div>
        </div>
      </section>

      <section id="research" className="section research-section">
        <div className="section-heading" data-reveal>
          <p className="section-label">01 · {t(copy.research.label, language)}</p>
          <h2>{t(copy.research.title, language)}</h2>
        </div>

        <div className="portfolio-heading" data-reveal>
          <p>{language === "en" ? "ARTICLES · BLOGS · VISUAL DECKS" : "文章 · 博客 · 视觉讲解"}</p>
          <span>{t(copy.research.count, language)}</span>
        </div>

        <div className="portfolio-feed">
          {portfolioEntries.map((item) => (
            <a
              className="portfolio-row"
              href={item.href}
              key={item.number}
              data-reveal
            >
              <div className="portfolio-thumb">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 700px) calc(100vw - 40px), 240px"
                  style={{ objectPosition: item.imagePosition ?? "center" }}
                />
                <span>{item.number}</span>
                <small>{item.kind === "deck" ? (language === "en" ? "WEB DECK" : "网页讲解") : (language === "en" ? "ARTICLE" : "文章")}</small>
              </div>
              <div className="portfolio-copy">
                <div className="portfolio-meta">
                  <p>{t(item.sourceType, language)}</p>
                  <small>{t(item.meta, language)}</small>
                </div>
                <h3>{t(item.title, language)}</h3>
                <p className="portfolio-excerpt">{t(item.excerpt, language)}</p>
              </div>
              <span className="portfolio-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>

      <section className="proof-strip" aria-label="Selected outcomes">
        {proofPoints.map((item) => (
          <div key={item.value} data-reveal>
            <strong>{item.value}</strong>
            <span>{t(item.label, language)}</span>
          </div>
        ))}
      </section>

      <section id="publication" className="section publication-section">
        <div className="publication-layout" data-reveal>
          <div className="publication-copy">
            <p className="section-label">02 · {t(copy.publication.label, language)}</p>
            <p className="publication-meta">ACM TKDD · DOI 10.1145/3690646</p>
            <h2>{t(copy.publication.title, language)}</h2>
            <p className="publication-journal">{t(copy.publication.journal, language)}</p>
            <p className="publication-abstract">{t(copy.publication.abstract, language)}</p>
            <p className="publication-authors">{t(copy.publication.authors, language)}</p>
            <div className="publication-actions">
              <a href="https://doi.org/10.1145/3690646" target="_blank" rel="noreferrer">{t(copy.publication.doi, language)} ↗</a>
              <a href="https://repository.kaust.edu.sa/items/9b87637c-4279-4a0c-a64f-0d29b5acc2c1" target="_blank" rel="noreferrer">{t(copy.publication.source, language)} ↗</a>
              <a href="/papers/fair-single-index-model.bib" download>{t(copy.publication.citation, language)} ↓</a>
            </div>
          </div>
          <div className="paper-visual" aria-hidden="true">
            <div className="paper-shadow" />
            <div className="paper-cover">
              <span>ACM</span>
              <small>TRANSACTIONS ON KNOWLEDGE<br />DISCOVERY FROM DATA</small>
              <i />
              <strong>FAIR<br />SINGLE<br />INDEX<br />MODEL</strong>
              <b>233</b>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className="section experience-section">
        <div className="section-heading" data-reveal>
          <p className="section-label">03 · {t(copy.experience.label, language)}</p>
          <h2>{t(copy.experience.title, language)}</h2>
        </div>

        <div className="experience-layout">
          <div className="timeline" data-reveal>
            {timeline.map((item) => (
              <article key={`${item.period}-${item.organization.en}`}>
                <span>{item.period}</span>
                <div>
                  <p>{t(item.role, language)}</p>
                  <h3>{t(item.organization, language)}</h3>
                  <small>{t(item.detail, language)}</small>
                </div>
              </article>
            ))}
          </div>

          <aside className="education-panel" data-reveal>
            <p className="section-label">{t(copy.experience.education, language)}</p>
            {education.map((item) => (
              <div className="education-item" key={item.school.en}>
                <span>{item.year}</span>
                <h3>{t(item.school, language)}</h3>
                <p>{t(item.degree, language)}</p>
              </div>
            ))}
            <a className="award-link" href={officialOutstandingStudentProof} target="_blank" rel="noreferrer">
              <span>Faculty Outstanding Student · 2023</span>
              <small>{t(copy.experience.evidence, language)} ↗</small>
            </a>
          </aside>
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <div className="contact-copy" data-reveal>
          <p className="section-label">04 · {t(copy.contact.label, language)}</p>
          <h2>{t(copy.contact.title, language)}</h2>
          <p>{t(copy.contact.body, language)}</p>
          <div className="contact-links">
            <a href="mailto:wangyidong020321@gmail.com">Email ↗</a>
            <a href="https://www.linkedin.com/in/eric-wangyidong/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a href="https://github.com/ericwang0321" target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <span>Eric Wang · 王逸东</span>
        <p>© {new Date().getFullYear()} · Hong Kong / Singapore</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
