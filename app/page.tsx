"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ResearchScene from "./components/ResearchScene";

type Language = "en" | "zh";

type Localized = {
  en: string;
  zh: string;
};

type ResearchItem = {
  number: string;
  title: Localized;
  category: Localized;
  href: string;
  year: string;
  tier: "featured" | "compact";
  image?: string;
};

type SystemWork = {
  number: string;
  title: Localized;
  category: Localized;
  meta: Localized;
  href: string;
  image: string;
  kind: "deck" | "article";
};

const officialOutstandingStudentProof =
  "https://www.polyu.edu.hk/sao/-/media/department/sao/content/srss/scholarships/osa/2023-24/fs_osa_sharing_wang-yidong.pdf?rev=d818a07102884a909ef84694e661e084&hash=ACB92226AB1532239025C9D15C6C093C";

const copy = {
  nav: {
    research: { en: "Research", zh: "研究" },
    publication: { en: "Publication", zh: "论文" },
    experience: { en: "Experience", zh: "经历" },
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
    title: { en: "Mapping the systems behind intelligence.", zh: "拆解智能背后的系统。" },
    open: { en: "Open research", zh: "打开研究" },
    more: { en: "More from the archive", zh: "更多研究档案" },
    systemsLabel: { en: "AI agents & model systems", zh: "AI Agent 与模型系统" },
    systemsTitle: { en: "From reasoning patterns to secure execution.", zh: "从推理模式到安全执行环境。" },
    systemsBody: {
      en: "Original visual explainers and long-form technical work on agents, harnesses, sandboxes and model-to-hardware deployment.",
      zh: "围绕 Agent、Harness、Sandbox 与模型硬件部署的原创视觉讲解和长篇技术研究。",
    },
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

const researchItems: ResearchItem[] = [
  {
    number: "01",
    title: { en: "The Closed-Loop AI Value Chain", zh: "AI 全产业链闭环地图" },
    category: { en: "Interactive atlas", zh: "交互图谱" },
    href: "/research/ai-chain/",
    year: "2026",
    tier: "featured",
    image: "/research/ai-chain/image2_diagrams/01-ai-value-chain-loop.png",
  },
  {
    number: "02",
    title: { en: "AI Infrastructure Knowledge Atlas", zh: "AI 基建知识图谱" },
    category: { en: "Technical systems", zh: "技术系统" },
    href: "/research/ai-infrastructure.html",
    year: "2026",
    tier: "featured",
    image: "/research/ai-chain/image2_diagrams/02-gpu-server-cutaway.png",
  },
  {
    number: "07",
    title: { en: "Memory, HBM & the AI Bottleneck", zh: "内存、HBM 与 AI 系统瓶颈" },
    category: { en: "Industry research", zh: "行业研究" },
    href: "/research/memory-hbm/",
    year: "2026",
    tier: "featured",
    image: "/research/ai-chain/image2_diagrams/03-gpu-hbm-cowos-package.png",
  },
  {
    number: "08",
    title: { en: "Optical Interconnects & CPO", zh: "光互联与 CPO 产业链" },
    category: { en: "Investment framework", zh: "投资框架" },
    href: "/research/optical-cpo/",
    year: "2026",
    tier: "featured",
    image: "/research/ai-chain/image2_diagrams/06-cpo-vs-pluggable-optics.png",
  },
  {
    number: "03",
    title: { en: "AI Inference Companies", zh: "AI 推理公司深度解析" },
    category: { en: "Company landscape", zh: "公司图谱" },
    href: "/research/ai-inference/",
    year: "2026",
    tier: "compact",
  },
  {
    number: "04",
    title: { en: "How 14 AI Companies Go to Market", zh: "14 家 AI 公司的 GTM 策略" },
    category: { en: "Go-to-market", zh: "商业化路径" },
    href: "/research/ai-gtm.html",
    year: "2026",
    tier: "compact",
  },
  {
    number: "05",
    title: { en: "The Companies That Feed AI", zh: "给 AI“喂饭”的三家公司" },
    category: { en: "AI data layer", zh: "AI 数据层" },
    href: "/research/ai-data-layer.html",
    year: "2026",
    tier: "compact",
  },
  {
    number: "06",
    title: { en: "Voice AI: Full Stack & 33 Companies", zh: "Voice AI 全技术路径与 33 家公司" },
    category: { en: "Application stack", zh: "应用技术栈" },
    href: "/research/voice-ai/",
    year: "2026",
    tier: "compact",
  },
];

const systemWorks: SystemWork[] = [
  {
    number: "09",
    title: { en: "The Three Layers of LLM Agents", zh: "LLM Agent 的三层结构" },
    category: { en: "Agent architecture", zh: "Agent 架构" },
    meta: { en: "13-page visual deck", zh: "13 页视觉讲解" },
    href: "/library/llm-agent-three-layers/",
    image: "/readings/llm-agent-three-layers/page-01.avif",
    kind: "deck",
  },
  {
    number: "10",
    title: { en: "Agents & Harnesses", zh: "Agent 与 Harness" },
    category: { en: "Agent systems", zh: "Agent 系统" },
    meta: { en: "19-page visual deck", zh: "19 页视觉讲解" },
    href: "/library/agent-harness/",
    image: "/readings/agent-harness/page-01.avif",
    kind: "deck",
  },
  {
    number: "11",
    title: { en: "Sandbox, Docker & Virtual Machines", zh: "Agent Sandbox 架构" },
    category: { en: "Secure execution", zh: "安全执行环境" },
    meta: { en: "11-page visual deck", zh: "11 页视觉讲解" },
    href: "/library/agent-sandbox/",
    image: "/readings/agent-sandbox/page-01.avif",
    kind: "deck",
  },
  {
    number: "12",
    title: { en: "Kimi K3: Architecture to Real Hardware", zh: "Kimi K3 架构与硬件部署" },
    category: { en: "Model × hardware", zh: "模型 × 硬件" },
    meta: { en: "42-page visual deck", zh: "42 页视觉讲解" },
    href: "/library/kimi-k3-deployment/",
    image: "/readings/kimi-k3-deployment/page-01.avif",
    kind: "deck",
  },
  {
    number: "13",
    title: { en: "Kimi K3: From Model Architecture to Real Hardware", zh: "Kimi K3：从模型架构到真实硬件" },
    category: { en: "Long-form technical article", zh: "长篇技术文章" },
    meta: { en: "10,000+ words · 7 architecture figures", zh: "10,000+ 词 · 7 张架构图" },
    href: "/research/kimi-k3/",
    image: "/readings/kimi-k3-deployment/page-03.avif",
    kind: "article",
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

  const featuredResearch = researchItems.filter((item) => item.tier === "featured");
  const compactResearch = researchItems.filter((item) => item.tier === "compact");

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
          <ResearchScene language={language} />
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

        <div className="featured-grid">
          {featuredResearch.map((item) => (
            <a className="featured-card" href={item.href} target="_blank" rel="noreferrer" key={item.number} data-reveal>
              <div className="featured-image">
                <Image
                  src={item.image ?? ""}
                  alt={t(item.title, language)}
                  fill
                  sizes="(max-width: 760px) 100vw, 50vw"
                />
                <span>{item.number}</span>
              </div>
              <div className="featured-copy">
                <p>{t(item.category, language)}</p>
                <h3>{t(item.title, language)}</h3>
                <span aria-label={t(copy.research.open, language)}>↗</span>
              </div>
            </a>
          ))}
        </div>

        <div className="archive-heading" data-reveal>
          <p>{t(copy.research.more, language)}</p>
          <span>04 / 08</span>
        </div>
        <div className="compact-grid">
          {compactResearch.map((item) => (
            <a className="compact-card" href={item.href} target="_blank" rel="noreferrer" key={item.number} data-reveal>
              <div><span>{item.number}</span><small>{item.year}</small></div>
              <p>{t(item.category, language)}</p>
              <h3>{t(item.title, language)}</h3>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>

        <div className="systems-heading" data-reveal>
          <div>
            <p>{t(copy.research.systemsLabel, language)}</p>
            <h3>{t(copy.research.systemsTitle, language)}</h3>
          </div>
          <p>{t(copy.research.systemsBody, language)}</p>
          <span>05 / NEW</span>
        </div>

        <div className="system-work-grid">
          {systemWorks.map((item) => (
            <a
              className={`system-work-card${item.kind === "article" ? " is-article" : ""}`}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              key={item.number}
              data-reveal
            >
              <div className="system-work-image">
                <Image src={item.image} alt={t(item.title, language)} fill sizes={item.kind === "article" ? "100vw" : "(max-width: 820px) 100vw, 50vw"} />
                <span>{item.number}</span>
                <small>{item.kind === "article" ? (language === "en" ? "ARTICLE" : "文章") : (language === "en" ? "WEB DECK" : "网页讲解")}</small>
              </div>
              <div className="system-work-copy">
                <p>{t(item.category, language)}</p>
                <h3>{t(item.title, language)}</h3>
                <small>{t(item.meta, language)}</small>
                <b aria-hidden="true">↗</b>
              </div>
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
