"use client";

import { useEffect, useMemo, useState } from "react";

type Language = "en" | "zh";
type ResearchCategory = "all" | "infrastructure" | "models" | "markets";

type Localized = {
  en: string;
  zh: string;
};

type ResearchItem = {
  number: string;
  title: Localized;
  description: Localized;
  category: Exclude<ResearchCategory, "all">;
  label: Localized;
  href: string;
  accent: "cyan" | "amber" | "violet";
};

const copy = {
  nav: {
    work: { en: "Research", zh: "研究" },
    publication: { en: "Publication", zh: "论文" },
    experience: { en: "Experience", zh: "经历" },
    contact: { en: "Contact", zh: "联系" },
  },
  hero: {
    eyebrow: { en: "AI × CAPITAL MARKETS", zh: "AI × 资本市场" },
    titleTop: { en: "Researching the", zh: "研究智能时代的" },
    titleAccent: { en: "infrastructure", zh: "基础设施" },
    titleBottom: { en: "of intelligence.", zh: "与资本脉络。" },
    intro: {
      en: "I map the physical and economic layers of AI—from silicon, memory and optical interconnects to models, applications and public-market signals.",
      zh: "我研究 AI 的物理与经济底座：从芯片、内存和光互联，到模型、应用与资本市场信号。",
    },
    explore: { en: "Explore research", zh: "浏览研究" },
    paper: { en: "Read publication", zh: "查看论文" },
    mapTitle: { en: "AI VALUE CHAIN / LIVE MAP", zh: "AI 价值链 / 动态地图" },
    mapHint: { en: "Hover the layers", zh: "探索各层" },
  },
  research: {
    eyebrow: { en: "SELECTED RESEARCH", zh: "精选研究" },
    title: { en: "Following constraints, not headlines.", zh: "追踪约束，而不只是追逐热点。" },
    intro: {
      en: "A curated selection from a broader research archive. Public pages focus on original synthesis and interactive analysis; internal operating materials are intentionally excluded.",
      zh: "以下内容精选自更完整的研究档案。公开页面聚焦原创梳理与交互分析，并主动排除内部流程与敏感材料。",
    },
    open: { en: "Open research", zh: "打开研究" },
    filters: {
      all: { en: "All", zh: "全部" },
      infrastructure: { en: "Infrastructure", zh: "AI 基建" },
      models: { en: "Models & Apps", zh: "模型与应用" },
      markets: { en: "Markets", zh: "资本市场" },
    },
  },
  publication: {
    eyebrow: { en: "PEER-REVIEWED PUBLICATION", zh: "同行评审论文" },
    title: { en: "Fair Single Index Model", zh: "公平单指数模型" },
    journal: {
      en: "ACM Transactions on Knowledge Discovery from Data · Vol. 18, No. 9 · 2024",
      zh: "ACM 数据知识发现汇刊 · 第 18 卷第 9 期 · 2024",
    },
    abstract: {
      en: "A unified framework for building interpretable single-index models under equal-opportunity constraints. The method is theoretically consistent in fairness and was evaluated across seven benchmark datasets against eight baselines.",
      zh: "提出一个在机会均等约束下构建可解释单指数模型的统一框架，在理论上证明公平一致性，并在 7 个基准数据集上与 8 种基线方法进行了系统比较。",
    },
    authors: { en: "Yidong Wang · Meng Ding · Jinhui Xu · Di Wang", zh: "王逸东 · 丁萌 · 徐金辉 · 王迪" },
    doi: { en: "View DOI", zh: "查看 DOI" },
    repository: { en: "Open-access source", zh: "开放获取原文" },
    cite: { en: "Download citation", zh: "下载引用" },
    metricA: { en: "benchmark datasets", zh: "个基准数据集" },
    metricB: { en: "baseline methods", zh: "种基线方法" },
    metricC: { en: "peer-reviewed pages", zh: "页同行评审论文" },
  },
  experience: {
    eyebrow: { en: "EXPERIENCE & EDUCATION", zh: "经历与教育" },
    title: { en: "Markets, models and systems.", zh: "市场、模型与系统。" },
    intro: {
      en: "A physics-trained financial engineer working at the intersection of investment research and applied AI.",
      zh: "以物理学与金融工程为底座，在投资研究与应用 AI 的交叉点工作。",
    },
  },
  systems: {
    eyebrow: { en: "SELECTED SYSTEMS", zh: "代表性系统" },
    title: { en: "Research that ships.", zh: "让研究真正落地。" },
  },
  contact: {
    eyebrow: { en: "LET'S CONNECT", zh: "保持联系" },
    title: { en: "Open to thoughtful conversations.", zh: "欢迎交流有深度的问题。" },
    body: {
      en: "AI infrastructure, public markets, quantitative research—or a difficult problem that sits between them.",
      zh: "无论是 AI 基建、资本市场、量化研究，还是横跨这些领域的复杂问题。",
    },
    email: { en: "Email me", zh: "发送邮件" },
  },
};

const researchItems: ResearchItem[] = [
  {
    number: "01",
    title: { en: "The Closed-Loop AI Value Chain", zh: "AI 全产业链闭环地图" },
    description: {
      en: "An interactive map connecting semiconductor manufacturing, compute systems, networks, energy, models and application demand.",
      zh: "交互式连接半导体制造、算力系统、网络、能源、模型与应用需求，呈现 AI 产业链的反馈闭环。",
    },
    category: "infrastructure",
    label: { en: "Interactive atlas", zh: "交互图谱" },
    href: "/research/ai-chain/",
    accent: "cyan",
  },
  {
    number: "02",
    title: { en: "AI Infrastructure Knowledge Atlas", zh: "AI 基建专有知识图谱" },
    description: {
      en: "A technical field guide to accelerators, HBM, advanced packaging, optical links, data-center power and cooling.",
      zh: "从加速器、HBM、先进封装与光互联，延伸至数据中心供电与冷却的技术知识地图。",
    },
    category: "infrastructure",
    label: { en: "Technical explainer", zh: "技术解析" },
    href: "/research/ai-infrastructure.html",
    accent: "amber",
  },
  {
    number: "03",
    title: { en: "AI Inference Companies", zh: "AI 推理公司深度解析" },
    description: {
      en: "How inference specialists compete through kernels, scheduling, KV-cache management, serving architecture and developer experience.",
      zh: "从算子、调度、KV Cache、服务架构与开发者体验，拆解推理公司的竞争路径。",
    },
    category: "models",
    label: { en: "Company landscape", zh: "公司图谱" },
    href: "/research/ai-inference/",
    accent: "violet",
  },
  {
    number: "04",
    title: { en: "How 14 AI Companies Go to Market", zh: "14 家 AI 公司的 GTM 策略" },
    description: {
      en: "A bilingual comparison of product-led, sales-led and hybrid growth motions across the emerging AI software stack.",
      zh: "双语比较新兴 AI 软件公司的产品驱动、销售驱动与混合增长路径。",
    },
    category: "models",
    label: { en: "Bilingual study", zh: "双语研究" },
    href: "/research/ai-gtm.html",
    accent: "cyan",
  },
  {
    number: "05",
    title: { en: "The Companies That Feed AI", zh: "给 AI“喂饭”的三家公司" },
    description: {
      en: "Mercor, Scale AI and Surge AI through the lens of data supply, expert networks, pricing power and business-model durability.",
      zh: "从数据供给、专家网络、定价权与商业模式韧性，对比 Mercor、Scale AI 与 Surge AI。",
    },
    category: "models",
    label: { en: "Data-layer analysis", zh: "数据层分析" },
    href: "/research/ai-data-layer.html",
    accent: "amber",
  },
  {
    number: "06",
    title: { en: "Voice AI: Full Stack & 33 Companies", zh: "Voice AI 全技术路径与 33 家公司" },
    description: {
      en: "From audio data and streaming ASR to turn-taking, orchestration, TTS and full-duplex speech models—plus a commercial landscape.",
      zh: "从音频数据、流式 ASR、轮次控制与编排，到 TTS 和全双工语音模型，并覆盖 33 家公司。",
    },
    category: "models",
    label: { en: "Research snapshot", zh: "研究摘要" },
    href: "/research/voice-ai/",
    accent: "violet",
  },
  {
    number: "07",
    title: { en: "Memory, HBM and the AI System Bottleneck", zh: "内存、HBM 与 AI 系统瓶颈" },
    description: {
      en: "A product-to-application view of HBM, DRAM and NAND, and why inference changes memory content, architecture and industry economics.",
      zh: "以产品到应用的框架研究 HBM、DRAM 与 NAND，以及推理需求如何改变内存含量、架构和产业经济性。",
    },
    category: "markets",
    label: { en: "Industry research", zh: "行业研究" },
    href: "/research/memory-hbm/",
    accent: "cyan",
  },
  {
    number: "08",
    title: { en: "Optical Interconnects & CPO", zh: "光互联与 CPO 产业链" },
    description: {
      en: "A market-oriented view of lasers, transceivers, optical circuit switching and co-packaged optics as cluster bandwidth becomes scarce.",
      zh: "当集群带宽成为稀缺资源，从激光器、光模块、光路交换到 CPO 梳理光互联价值链。",
    },
    category: "markets",
    label: { en: "Investment framework", zh: "投资框架" },
    href: "/research/optical-cpo/",
    accent: "amber",
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
      en: "Developed cross-asset data pipelines and redesigned backtesting modules, reducing multi-factor simulation runtime by approximately 90%.",
      zh: "开发跨资产数据管线并重构回测模块，使多因子模拟运行时间降低约 90%。",
    },
  },
  {
    period: "2024—25",
    organization: { en: "Hengli Petrochemical International", zh: "恒力石化国际" },
    role: { en: "Trading Analytics · Crude Oil", zh: "原油交易分析" },
    detail: {
      en: "Integrated shipping, refinery and market data into real-time dashboards for physical crude-oil trading decisions.",
      zh: "整合航运、炼厂和市场数据，为实体原油交易构建实时分析仪表板。",
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

const systems = [
  {
    value: "500+",
    title: { en: "Equities monitored", zh: "覆盖股票" },
    body: { en: "Automated daily CCASS ownership-change detection.", zh: "自动检测每日 CCASS 持仓变化。" },
  },
  {
    value: "−90%",
    title: { en: "Backtest runtime", zh: "回测耗时" },
    body: { en: "Faster factor research through modular Python, Parquet and DuckDB workflows.", zh: "借助模块化 Python、Parquet 与 DuckDB 加速因子研究。" },
  },
  {
    value: "AI+",
    title: { en: "Research automation", zh: "研究自动化" },
    body: { en: "Prospectus extraction, natural-language retrieval and market-intelligence pipelines.", zh: "招股书抽取、自然语言检索与市场情报管线。" },
  },
];

const stackNodes = [
  { key: "silicon", en: "SILICON", zh: "芯片", className: "node-silicon" },
  { key: "compute", en: "COMPUTE", zh: "算力", className: "node-compute" },
  { key: "network", en: "NETWORK", zh: "网络", className: "node-network" },
  { key: "energy", en: "ENERGY", zh: "能源", className: "node-energy" },
  { key: "models", en: "MODELS", zh: "模型", className: "node-models" },
  { key: "apps", en: "APPLICATIONS", zh: "应用", className: "node-apps" },
];

function t(value: Localized, language: Language) {
  return value[language];
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [filter, setFilter] = useState<ResearchCategory>("all");
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
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [filter]);

  const filteredResearch = useMemo(
    () => researchItems.filter((item) => filter === "all" || item.category === filter),
    [filter],
  );

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY}px`);
  };

  return (
    <main className="site-shell" onPointerMove={handlePointerMove}>
      <div className="cursor-aura" aria-hidden="true" />

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Eric Wang home">
          <span>EW</span>
          <i />
          <small>ERIC WANG</small>
        </a>

        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
          <b>{menuOpen ? "CLOSE" : "MENU"}</b>
        </button>

        <nav id="site-navigation" className={menuOpen ? "nav-links is-open" : "nav-links"} aria-label="Primary navigation">
          <a href="#research" onClick={() => setMenuOpen(false)}>{t(copy.nav.work, language)}</a>
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
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy" data-reveal>
          <p className="eyebrow"><span>01</span>{t(copy.hero.eyebrow, language)}</p>
          <h1>
            <span>{t(copy.hero.titleTop, language)}</span>
            <em>{t(copy.hero.titleAccent, language)}</em>
            <span>{t(copy.hero.titleBottom, language)}</span>
          </h1>
          <p className="hero-intro">{t(copy.hero.intro, language)}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#research">{t(copy.hero.explore, language)} <span>↘</span></a>
            <a className="button button-ghost" href="#publication">{t(copy.hero.paper, language)} <span>→</span></a>
          </div>
          <div className="hero-identity">
            <span>王逸东</span>
            <i />
            <strong>ERIC WANG</strong>
            <small>HONG KONG · SINGAPORE</small>
          </div>
        </div>

        <div className="stack-map" data-reveal>
          <div className="map-heading">
            <span>{t(copy.hero.mapTitle, language)}</span>
            <small><i /> {t(copy.hero.mapHint, language)}</small>
          </div>
          <div className="map-orbit orbit-one" />
          <div className="map-orbit orbit-two" />
          <div className="map-core">
            <span>AI</span>
            <small>VALUE</small>
          </div>
          {stackNodes.map((node, index) => (
            <a
              className={`map-node ${node.className}`}
              href={node.key === "models" || node.key === "apps" ? "#research" : "/research/ai-chain/"}
              key={node.key}
              style={{ "--node-delay": `${index * 0.18}s` } as React.CSSProperties}
            >
              <i />
              <span>{language === "en" ? node.en : node.zh}</span>
              <small>0{index + 1}</small>
            </a>
          ))}
          <div className="signal-line line-a" />
          <div className="signal-line line-b" />
          <div className="signal-line line-c" />
        </div>

        <a className="scroll-cue" href="#research" aria-label="Scroll to research">
          <span>SCROLL</span><i />
        </a>
      </section>

      <section id="research" className="section research-section">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow"><span>02</span>{t(copy.research.eyebrow, language)}</p>
            <h2>{t(copy.research.title, language)}</h2>
          </div>
          <p>{t(copy.research.intro, language)}</p>
        </div>

        <div className="research-toolbar" role="group" aria-label="Filter research">
          {(Object.keys(copy.research.filters) as ResearchCategory[]).map((key) => (
            <button
              type="button"
              key={key}
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key)}
              aria-pressed={filter === key}
            >
              {t(copy.research.filters[key], language)}
            </button>
          ))}
          <span>{String(filteredResearch.length).padStart(2, "0")} / {String(researchItems.length).padStart(2, "0")}</span>
        </div>

        <div className="research-grid">
          {filteredResearch.map((item) => (
            <article className={`research-card accent-${item.accent}`} key={item.number} data-reveal>
              <div className="card-topline">
                <span>{item.number}</span>
                <small>{t(item.label, language)}</small>
              </div>
              <div className="card-visual" aria-hidden="true">
                <div className="visual-grid" />
                <span className="visual-index">{item.number}</span>
                <i className="visual-ring" />
                <i className="visual-dot dot-one" />
                <i className="visual-dot dot-two" />
                <i className="visual-line" />
              </div>
              <h3>{t(item.title, language)}</h3>
              <p>{t(item.description, language)}</p>
              <a href={item.href} target="_blank" rel="noreferrer">
                {t(copy.research.open, language)} <span>↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="publication" className="section publication-section">
        <div className="publication-card" data-reveal>
          <div className="publication-copy">
            <p className="eyebrow"><span>03</span>{t(copy.publication.eyebrow, language)}</p>
            <div className="publication-meta">
              <span>ACM TKDD</span>
              <i />
              <span>DOI 10.1145/3690646</span>
            </div>
            <h2>{t(copy.publication.title, language)}</h2>
            <p className="publication-journal">{t(copy.publication.journal, language)}</p>
            <p className="publication-abstract">{t(copy.publication.abstract, language)}</p>
            <p className="publication-authors">{t(copy.publication.authors, language)}</p>
            <div className="publication-actions">
              <a href="https://doi.org/10.1145/3690646" target="_blank" rel="noreferrer">{t(copy.publication.doi, language)} <span>↗</span></a>
              <a href="https://repository.kaust.edu.sa/items/9b87637c-4279-4a0c-a64f-0d29b5acc2c1" target="_blank" rel="noreferrer">{t(copy.publication.repository, language)} <span>↗</span></a>
              <a href="/papers/fair-single-index-model.bib" download>{t(copy.publication.cite, language)} <span>↓</span></a>
            </div>
          </div>
          <div className="publication-visual" aria-hidden="true">
            <div className="paper-sheet paper-back" />
            <div className="paper-sheet paper-front">
              <span>ACM</span>
              <small>TRANSACTIONS ON KNOWLEDGE<br />DISCOVERY FROM DATA</small>
              <i />
              <strong>FAIR<br />SINGLE<br />INDEX<br />MODEL</strong>
              <b>233</b>
            </div>
          </div>
        </div>
        <div className="publication-metrics" data-reveal>
          <div><strong>7</strong><span>{t(copy.publication.metricA, language)}</span></div>
          <div><strong>8</strong><span>{t(copy.publication.metricB, language)}</span></div>
          <div><strong>33</strong><span>{t(copy.publication.metricC, language)}</span></div>
        </div>
      </section>

      <section id="experience" className="section experience-section">
        <div className="section-heading" data-reveal>
          <div>
            <p className="eyebrow"><span>04</span>{t(copy.experience.eyebrow, language)}</p>
            <h2>{t(copy.experience.title, language)}</h2>
          </div>
          <p>{t(copy.experience.intro, language)}</p>
        </div>

        <div className="experience-layout">
          <div className="timeline" data-reveal>
            {timeline.map((item) => (
              <article key={`${item.period}-${item.organization.en}`}>
                <div className="timeline-marker"><i /></div>
                <span className="timeline-period">{item.period}</span>
                <div>
                  <h3>{t(item.organization, language)}</h3>
                  <h4>{t(item.role, language)}</h4>
                  <p>{t(item.detail, language)}</p>
                </div>
              </article>
            ))}
          </div>

          <aside className="education-panel" data-reveal>
            <span className="panel-label">EDUCATION / 教育</span>
            {education.map((item) => (
              <div className="education-item" key={item.school.en}>
                <small>{item.year}</small>
                <h3>{t(item.school, language)}</h3>
                <p>{t(item.degree, language)}</p>
              </div>
            ))}
            <div className="award-strip">
              <span>HKSAR GOVERNMENT SCHOLARSHIP</span>
              <a
                href="https://www.polyu.edu.hk/sao/-/media/department/sao/content/srss/scholarships/osa/2023-24/fs_osa_sharing_wang-yidong.pdf?rev=d818a07102884a909ef84694e661e084&hash=ACB92226AB1532239025C9D15C6C093C"
                target="_blank"
                rel="noreferrer"
              >
                FACULTY OUTSTANDING STUDENT · 2023 ↗
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section className="section systems-section">
        <div className="systems-heading" data-reveal>
          <p className="eyebrow"><span>05</span>{t(copy.systems.eyebrow, language)}</p>
          <h2>{t(copy.systems.title, language)}</h2>
        </div>
        <div className="systems-grid">
          {systems.map((item) => (
            <article key={item.value} data-reveal>
              <strong>{item.value}</strong>
              <h3>{t(item.title, language)}</h3>
              <p>{t(item.body, language)}</p>
            </article>
          ))}
        </div>
        <div className="skill-ticker" aria-label="Skills">
          <div>
            <span>PYTHON</span><i />
            <span>SQL</span><i />
            <span>FINANCIAL MODELLING</span><i />
            <span>AI RESEARCH AUTOMATION</span><i />
            <span>PUBLIC EQUITIES</span><i />
            <span>BACKTESTING</span><i />
            <span>PYTHON</span><i />
            <span>SQL</span><i />
            <span>FINANCIAL MODELLING</span><i />
            <span>AI RESEARCH AUTOMATION</span><i />
          </div>
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <div className="contact-card" data-reveal>
          <p className="eyebrow"><span>06</span>{t(copy.contact.eyebrow, language)}</p>
          <h2>{t(copy.contact.title, language)}</h2>
          <p>{t(copy.contact.body, language)}</p>
          <div className="contact-links">
            <a className="button button-primary" href="mailto:wangyidong020321@gmail.com">{t(copy.contact.email, language)} <span>↗</span></a>
            <a href="https://www.linkedin.com/in/eric-wangyidong/" target="_blank" rel="noreferrer">LinkedIn <span>↗</span></a>
            <a href="https://github.com/ericwang0321" target="_blank" rel="noreferrer">GitHub <span>↗</span></a>
          </div>
          <div className="contact-signal" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        </div>
      </section>

      <footer className="site-footer">
        <a className="wordmark" href="#top"><span>EW</span><i /><small>ERIC WANG</small></a>
        <p>© {new Date().getFullYear()} Eric Wang. Built for curious minds.</p>
        <a href="#top">BACK TO TOP ↑</a>
      </footer>
    </main>
  );
}
