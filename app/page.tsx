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
  group: "company" | "technology";
  imagePosition?: string;
};

const officialOutstandingStudentProof =
  "https://www.polyu.edu.hk/sao/-/media/department/sao/content/srss/scholarships/osa/2023-24/fs_osa_sharing_wang-yidong.pdf?rev=d818a07102884a909ef84694e661e084&hash=ACB92226AB1532239025C9D15C6C093C";

const officialLeadershipAwardNews =
  "https://www.polyu.edu.hk/abct/news-and-events/news-and-awards/2024/polyu-outstanding-student-award-and-presidential-student-leadership-award-2023/";

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
  },
  contact: {
    label: { en: "Contact", zh: "联系" },
    title: { en: "Feel free to get in touch.", zh: "欢迎联系我。" },
    body: {
      en: "You can reach me by email or connect with me on LinkedIn.",
      zh: "可以通过邮件或 LinkedIn 联系我。",
    },
  },
};

const portfolioEntries: PortfolioEntry[] = [
  {
    number: "01",
    title: { en: "AI Value Chain", zh: "AI 价值链" },
    excerpt: {
      en: "Start from who pays for AI, then trace the demand signal through applications, models, compute infrastructure, semiconductor manufacturing, and finally power and data-center resources.",
      zh: "从“谁为 AI 付费”开始，沿着应用需求、模型服务、算力基础设施、半导体制造、能源和数据中心资源逐层下钻。",
    },
    href: "/research/ai-chain/",
    meta: { en: "Interactive HTML · 2026", zh: "交互式 HTML · 2026" },
    sourceType: { en: "AI VALUE CHAIN", zh: "AI 产业链" },
    image: "/hero-journey/01-grid-campus-v1.jpg",
    kind: "article",
    group: "technology",
  },
  {
    number: "02",
    title: { en: "AI Infrastructure Knowledge", zh: "AI 基础设施知识" },
    excerpt: {
      en: "Think of AI infrastructure as an engineering chain: power enters the site, GPUs and servers turn electricity into compute, cooling removes the heat, and networking connects GPUs into clusters.",
      zh: "把 AI 基建看成一条工程链：电力进来，GPU/服务器把电变成算力，散热系统把热带走，网络把 GPU 连成集群。",
    },
    href: "/research/ai-infrastructure.html",
    meta: { en: "Interactive HTML · 2026", zh: "交互式 HTML · 2026" },
    sourceType: { en: "AI INFRASTRUCTURE", zh: "AI 基础设施" },
    image: "/hero-journey/06-campus-rack-bridge-v2.jpg",
    kind: "article",
    group: "technology",
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
    group: "company",
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
    group: "company",
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
    group: "company",
  },
  {
    number: "06",
    title: { en: "LLM Inference Optimization, Illustrated", zh: "LLM Inference Optimization, Illustrated" },
    excerpt: {
      en: "The journey of a prompt, and the two families of techniques that make it fast: optimizations built around the KV cache, and optimizations that have nothing to do with it.",
      zh: "The journey of a prompt, and the two families of techniques that make it fast: optimizations built around the KV cache, and optimizations that have nothing to do with it.",
    },
    href: "/research/llm-inference-optimization/",
    meta: { en: "Source blog · Jul 2026", zh: "原文博客 · 2026 年 7 月" },
    sourceType: { en: "LLM INFERENCE", zh: "LLM 推理" },
    image: "/hero-journey/09-tray-gpu-macro-v2.jpg",
    kind: "article",
    group: "technology",
  },
  {
    number: "07",
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
    group: "technology",
  },
  {
    number: "08",
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
    group: "technology",
  },
  {
    number: "09",
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
    group: "technology",
  },
  {
    number: "10",
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
    group: "technology",
  },
  {
    number: "11",
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
    group: "technology",
  },
];

const technologyResearch = portfolioEntries.filter((entry) => entry.group === "technology");

const workExperience = [
  {
    period: { en: "Apr 2026—Present", zh: "2026 年 4 月—至今" },
    organization: { en: "Yuanbao (Hong Kong)", zh: "元保（香港）" },
    role: { en: "AI Investment Analyst · Capital Markets", zh: "AI 投资分析 · 资本市场" },
    detail: {
      en: "Research the AI value chain and related companies across private and public markets, combining technical, business-model and market analysis.",
      zh: "研究 AI 价值链及相关公司，结合技术、商业模式与市场变化，分析一级和公开市场机会。",
    },
    logo: "/companies/yuanbao.png",
    logoAlt: "Yuanbao logo",
    logoScale: "compact" as const,
    website: "https://ir.yb-inc.com/",
  },
  {
    period: { en: "Feb—Mar 2026", zh: "2026 年 2—3 月" },
    organization: { en: "China Asset Management (Hong Kong)", zh: "华夏基金（香港）" },
    role: { en: "AI & Equity Research", zh: "AI 与股票研究" },
    detail: {
      en: "Worked on IPO research, capital-flow dashboards and CCASS data tracking.",
      zh: "参与 IPO 研究、资金流仪表板和 CCASS 数据追踪。",
    },
    logo: "/companies/chinaamc.png",
    logoAlt: "China Asset Management (Hong Kong) logo",
    website: "https://www.chinaamc.com.hk/",
  },
  {
    period: "2025",
    organization: { en: "GaoTeng Global Asset Management", zh: "高腾环球资产管理" },
    role: { en: "Quantitative Research · ETFs", zh: "量化研究 · ETF" },
    detail: {
      en: "Worked on multi-factor research, ETF analysis and backtesting pipelines.",
      zh: "参与多因子研究、ETF 分析和回测数据管线搭建。",
    },
    logo: "/companies/gaoteng.png",
    logoAlt: "GaoTeng Global Asset Management logo",
    website: "https://www.gaotengasset.com/",
  },
  {
    period: "2024—25",
    organization: { en: "Hengli Petrochemical International", zh: "恒力石化国际" },
    role: { en: "Trading Analytics · Crude Oil", zh: "原油交易分析" },
    detail: {
      en: "Analyzed shipping, refinery and market data for physical crude-oil trading.",
      zh: "整理航运、炼厂和市场数据，支持实体原油交易分析。",
    },
    logo: "/companies/hengli.png",
    logoAlt: "Hengli Group logo",
    logoScale: "subtle" as const,
    website: "https://www.hengli.com/global/",
  },
];

const education = [
  {
    year: "2026",
    school: { en: "National University of Singapore", zh: "新加坡国立大学" },
    degree: { en: "MSc, Financial Engineering · Distinction", zh: "金融工程硕士 · Distinction" },
    logo: "/schools/nus.png",
    logoAlt: "National University of Singapore logo",
    logoScale: "large" as const,
    website: "https://nus.edu.sg/",
  },
  {
    year: "2024",
    school: { en: "The Hong Kong Polytechnic University", zh: "香港理工大学" },
    degree: { en: "BSc (Hons), Physics · First Class · Top 5%", zh: "物理学荣誉学士 · 一等荣誉 · 前 5%" },
    logo: "/schools/polyu.png",
    logoAlt: "The Hong Kong Polytechnic University logo",
    logoScale: "large" as const,
    website: "https://www.polyu.edu.hk/",
  },
  {
    year: "2023",
    school: { en: "North Carolina State University", zh: "北卡罗来纳州立大学" },
    degree: {
      en: "Exchange Semester · Statistics · Raleigh, North Carolina, USA",
      zh: "交换学期 · 统计学 · 美国北卡罗来纳州罗利",
    },
    logo: "/schools/nc-state.png",
    logoAlt: "NC State University logo",
    logoScale: "large" as const,
    website: "https://www.ncsu.edu/",
  },
  {
    year: "2022",
    school: {
      en: "King Abdullah University of Science and Technology",
      zh: "阿卜杜拉国王科技大学（KAUST）",
    },
    degree: {
      en: "Visiting Research Student · Summer Research",
      zh: "访问研究学生 · 暑期研究",
    },
    logo: "/schools/kaust.svg",
    logoAlt: "King Abdullah University of Science and Technology logo",
    website: "https://www.kaust.edu.sa/",
  },
];

function TimelineColumn({
  title,
  items,
  language,
}: {
  title: Localized;
  items: Array<{
    period?: string | Localized;
    year?: string;
    organization?: Localized;
    school?: Localized;
    role?: Localized;
    degree?: Localized;
    detail?: Localized;
    logo?: string;
    logoAlt?: string;
    logoScale?: "compact" | "subtle" | "large";
    website?: string;
  }>;
  language: Language;
}) {
  return (
    <div className="timeline-column">
      <h3>{t(title, language)}</h3>
      <div className="timeline-list">
        {items.map((item) => {
          const name = item.organization ?? item.school;
          const description = item.detail ?? item.degree;
          const date = typeof item.period === "string" ? item.period : item.period ? t(item.period, language) : item.year;
          return (
            <article className="timeline-item" key={`${date}-${name?.en}`}>
              <span className="timeline-dot" aria-hidden="true" />
              <time>{date}</time>
              <div className="timeline-item-heading">
                <div>
                  <p>{item.role ? t(item.role, language) : language === "en" ? "Education" : "教育经历"}</p>
                  <h4>{name ? t(name, language) : ""}</h4>
                </div>
                {item.logo && item.website ? (
                  <a
                    className={`timeline-logo${item.logoScale ? ` timeline-logo--${item.logoScale}` : ""}`}
                    href={item.website}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.logoAlt}
                  >
                    <Image
                      src={item.logo}
                      alt={item.logoAlt ?? ""}
                      fill
                      sizes={
                        item.logoScale === "large"
                          ? "(max-width: 640px) 125px, 154px"
                          : item.logoScale === "compact"
                            ? "(max-width: 640px) 83px, 102px"
                            : item.logoScale === "subtle"
                              ? "(max-width: 640px) 94px, 115px"
                            : "(max-width: 640px) 104px, 128px"
                      }
                    />
                  </a>
                ) : null}
              </div>
              <p className="timeline-detail">{description ? t(description, language) : ""}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function t(value: Localized, language: Language) {
  return value[language];
}

function ResearchList({ entries, language }: { entries: PortfolioEntry[]; language: Language }) {
  return (
    <div className="research-list">
      {entries.map((item) => (
        <article className="research-row" key={item.number}>
          <a className="research-card-link" href={item.href}>
            <span className="research-thumbnail" aria-hidden="true">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="(max-width: 720px) calc(100vw - 48px), 300px"
                style={{ objectPosition: item.imagePosition ?? "center" }}
              />
            </span>
            <div className="research-copy">
              <div className="research-topline">
                <p className="research-meta">{item.number} · {t(item.sourceType, language)} · {t(item.meta, language)}</p>
                <span className="research-arrow" aria-hidden="true">↗</span>
              </div>
              <h3>{t(item.title, language)}</h3>
              <p>{t(item.excerpt, language)}</p>
            </div>
          </a>
        </article>
      ))}
    </div>
  );
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
    <main className="portfolio-site" id="top">
      <header className="site-header">
        <div className="header-inner">
          <a className="header-brand" href="#top">Eric Wang</a>
          <nav className="header-nav" aria-label="Primary navigation">
            <a href="#experience">{t(copy.nav.experience, language)}</a>
            <a href="#honors">{t(copy.nav.honors, language)}</a>
            <a href="#about">{t(copy.nav.about, language)}</a>
            <a href="#research">{t(copy.nav.research, language)}</a>
            <a href="#publication">{t(copy.nav.publication, language)}</a>
          </nav>
          <div className="header-actions">
            <a className="usage-link" href="/codex-usage/">{t(copy.nav.usage, language)}</a>
            <button
              className="language-toggle"
              type="button"
              onClick={() => setLanguage((current) => (current === "en" ? "zh" : "en"))}
              aria-label={language === "en" ? "切换至中文" : "Switch to English"}
            >
              {language === "en" ? "中文" : "EN"}
            </button>
            <a className="header-cta" href="mailto:wangyidong020321@gmail.com">
              {language === "en" ? "Let’s talk" : "联系我"} ↗
            </a>
          </div>
        </div>
      </header>

      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-identity">
          <Image
            className="hero-avatar"
            src="/eric.png"
            alt="Eric Wang"
            width={538}
            height={720}
            priority
          />
          <div>
            <strong>Eric Wang</strong>
            <span>{language === "en" ? "Hong Kong · Singapore" : "香港 · 新加坡"}</span>
          </div>
        </div>
        <h1 id="hero-title">
          {language === "en" ? (
            <>AI infrastructure,<br /> technology and markets.</>
          ) : (
            <>AI 基础设施、技术<br />与资本市场。</>
          )}
        </h1>
        <p className="hero-thesis">
          {language === "en"
            ? "I follow AI from first principles to real-world consequences—because I believe it will change both how we build and how we live."
            : "我从基本原理一路追到现实影响，因为我相信，AI 会同时改变我们构建技术和生活的方式。"}
        </p>
        <nav className="explore-panel" aria-label={language === "en" ? "Explore Eric Wang’s work" : "浏览 Eric Wang 的研究"}>
          <div className="explore-chips">
            <a href="#research">{language === "en" ? "Writing" : "文章与研究"}</a>
            <a href="#publication">{t(copy.nav.publication, language)}</a>
            <a href="/codex-usage/">Codex {t(copy.nav.usage, language)}</a>
          </div>
        </nav>
        <div className="hero-links" aria-label="Profile links">
          <a href="mailto:wangyidong020321@gmail.com">Email ↗</a>
          <a href="https://www.linkedin.com/in/eric-wangyidong/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a href="https://github.com/ericwang0321" target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </section>

      <div className="site-container">
        <section id="about" className="page-section about-section">
          <div className="about-intro">
            <div className="section-heading about-heading">
              <p className="section-kicker">{language === "en" ? "Introduction" : "个人简介"}</p>
              <h2>{language === "en" ? "A little about me." : "简单介绍一下我。"}</h2>
            </div>
            <div className="about-copy">
              <p>
                {language === "en"
                  ? "I’m Eric Wang. I have studied and worked in Hong Kong and Singapore, with training in physics and financial engineering. I’m interested in AI infrastructure, technology and markets—especially how advances in compute and software translate into changes in companies and industries."
                  : "我是 Eric Wang，曾在香港和新加坡学习与工作，拥有物理和金融工程背景。我关注 AI 基础设施、技术和市场，尤其想理解算力与软件的进步如何进一步影响公司和产业。"}
              </p>
              <p>
                {language === "en"
                  ? "Outside work, I play tennis, go to the gym, travel when I can, and occasionally play Texas Hold’em. I also enjoy trying new technologies and learning how people build and use them."
                  : "工作之外，我会打网球、健身，有机会就去旅行，偶尔也玩德州扑克。我也喜欢尝试新技术，了解它们是如何被开发和使用的。"}
              </p>
            </div>
          </div>
          <div className="about-languages">
            <span>{language === "en" ? "Languages" : "语言"}</span>
            <ul>
              <li>{language === "en" ? "Mandarin" : "普通话"}</li>
              <li>{language === "en" ? "Cantonese" : "粤语"}</li>
              <li>{language === "en" ? "English" : "英语"}</li>
              <li>{language === "en" ? "French" : "法语"}</li>
            </ul>
          </div>
        </section>

        <section id="experience" className="page-section experience-section">
          <div className="section-heading">
            <p className="section-kicker">{language === "en" ? "Experience" : "经历"}</p>
            <h2>{language === "en" ? "Education and internships." : "教育与实习经历。"}</h2>
          </div>
          <div className="timeline-board">
            <TimelineColumn title={{ en: "Education", zh: "教育经历" }} items={education} language={language} />
            <TimelineColumn title={{ en: "Internships", zh: "实习经历" }} items={workExperience} language={language} />
          </div>
        </section>

        <section id="honors" className="page-section">
          <div className="section-heading">
            <p className="section-kicker">{language === "en" ? "Recognition" : "认可"}</p>
            <h2>{language === "en" ? "Honors and awards." : "荣誉与奖项。"}</h2>
          </div>
          <ul className="awards-panel">
            <li>
              <time>2023</time>
              <a href={officialOutstandingStudentProof} target="_blank" rel="noreferrer">
                <span>Faculty Outstanding Student, The Hong Kong Polytechnic University</span><b aria-hidden="true">↗</b>
              </a>
            </li>
            <li>
              <time>2023</time>
              <a href={officialLeadershipAwardNews} target="_blank" rel="noreferrer">
                <span>Presidential Student Leadership Award, The Hong Kong Polytechnic University</span><b aria-hidden="true">↗</b>
              </a>
            </li>
            <li>
              <time>2023/24</time>
              <span>Scholarship for Outstanding Performance, Hong Kong SAR Government Scholarship Fund</span>
            </li>
            <li>
              <time>2022/23</time>
              <span>Scholarship for Outstanding Performance, Hong Kong SAR Government Scholarship Fund</span>
            </li>
            <li>
              <time>2022/23</time>
              <span>Hong Kong, China – Asia-Pacific Economic Cooperation Scholarship (HK–APEC Scholarship)</span>
            </li>
            <li>
              <time>2022/23</time>
              <span>Reaching Out Award, Hong Kong SAR Government Scholarship Fund</span>
            </li>
          </ul>
        </section>

        <section id="publication" className="page-section publication-section">
          <div className="section-heading">
            <p className="section-kicker">{language === "en" ? "Peer-reviewed publication" : "同行评审论文"}</p>
            <h2>{language === "en" ? "Fairness, made interpretable." : "让公平性保持可解释。"}</h2>
          </div>
          <div className="publication-feature">
            <figure className="publication-figure">
              <Image
                src="/papers/fair-single-index-model-figure-1.jpg"
                alt="Fairness-accuracy tradeoffs for FSIM and baseline models on the Arrhythmia and Compas datasets"
                width={398}
                height={500}
                sizes="(max-width: 720px) calc(100vw - 48px), 420px"
              />
              <figcaption>
                {language === "en"
                  ? "Figure 1 · Fairness-accuracy tradeoffs on Arrhythmia and Compas."
                  : "图 1 · Arrhythmia 与 Compas 数据集上的公平性—准确率权衡。"}
              </figcaption>
            </figure>
            <article className="publication-entry">
              <p className="publication-meta">ACM TKDD · 2024</p>
              <h3>
                <a href="https://doi.org/10.1145/3690646" target="_blank" rel="noreferrer">
                  Fair Single Index Model
                </a>
              </h3>
              <p className="publication-authors"><strong>Yidong Wang</strong>, Meng Ding, Jinhui Xu, Di Wang</p>
              <p>{t(copy.publication.abstract, language)}</p>
              <div className="inline-links">
                <a href="https://doi.org/10.1145/3690646" target="_blank" rel="noreferrer">DOI ↗</a>
                <a href="https://repository.kaust.edu.sa/items/9b87637c-4279-4a0c-a64f-0d29b5acc2c1" target="_blank" rel="noreferrer">KAUST ↗</a>
                <a href="/papers/fair-single-index-model.bib" download>BibTeX ↓</a>
              </div>
            </article>
          </div>
        </section>

        <section id="research" className="page-section research-section">
          <div className="section-heading section-heading-inline">
            <div>
              <p className="section-kicker">{language === "en" ? "Selected writing" : "部分内容"}</p>
              <h2>{language === "en" ? "Notes and visual explainers." : "研究笔记与可视化内容。"}</h2>
            </div>
            <span>{technologyResearch.length} {language === "en" ? "works" : "项成果"}</span>
          </div>
          <ResearchList entries={technologyResearch} language={language} />
        </section>

        <section id="contact" className="contact-section">
          <p className="section-kicker">{t(copy.contact.label, language)}</p>
          <h2>{t(copy.contact.title, language)}</h2>
          <p>{t(copy.contact.body, language)}</p>
          <div className="contact-links">
            <a href="mailto:wangyidong020321@gmail.com">Email ↗</a>
            <a href="https://www.linkedin.com/in/eric-wangyidong/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a href="https://github.com/ericwang0321" target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </section>
      </div>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Eric Wang · Hong Kong / Singapore</p>
        <a href="#top">{language === "en" ? "Back to top" : "返回顶部"} ↑</a>
      </footer>
    </main>
  );
}
