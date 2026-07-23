import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Insight = {
  number: string;
  title: string;
  body: string;
};

type Article = {
  slug: string;
  category: string;
  date: string;
  title: string;
  englishTitle: string;
  deck: string;
  thesis: string;
  insights: Insight[];
  watch: string[];
  conclusion: string;
  sourceNote: string;
  accent: "cyan" | "amber" | "violet";
};

const articles: Article[] = [
  {
    slug: "ai-inference",
    category: "AI MODELS & INFRASTRUCTURE",
    date: "JUL 2026",
    title: "AI 推理公司的竞争边界",
    englishTitle: "AI Inference Companies: Where the Moat Actually Lives",
    deck: "从算子、KV Cache、调度与 P/D 分离，到多云交付和开发者体验：推理服务的护城河并不只是“更便宜的 GPU”。",
    thesis: "推理市场的核心矛盾，是模型能力不断提升，但单位任务的可接受成本、延迟与可靠性必须持续下降。真正的价值因此从“拥有 GPU”转移到“让 GPU 在复杂工作负载下稳定、高效地工作”。",
    insights: [
      {
        number: "01",
        title: "性能来自完整系统，而非单点优化",
        body: "高效推理需要内核优化、连续批处理、量化、KV Cache 管理、请求路由和显存调度协同工作。单个 benchmark 的领先并不等于真实生产环境的领先。",
      },
      {
        number: "02",
        title: "Prefill 与 Decode 正在被拆成两种工作负载",
        body: "Prefill 更偏计算密集，Decode 更受内存带宽约束。P/D 分离让不同硬件、调度策略和弹性方式分别服务两段流程，是推理架构的重要演进。",
      },
      {
        number: "03",
        title: "商业护城河来自工作负载与交付能力",
        body: "长期差异化更可能来自真实请求数据、稳定性工程、模型上线速度、多云部署、企业安全与开发者工作流，而不是短期 GPU 采购成本。",
      },
      {
        number: "04",
        title: "开源会压缩技术红利，但不会消灭运营差异",
        body: "FlashAttention、vLLM 等开源工具让底层能力扩散得更快；与此同时，容量规划、SLA、故障切换与客户集成仍具有强烈的运营属性。",
      },
    ],
    watch: ["TTFT / TPOT 与尾部延迟", "每美元吞吐量与 GPU 利用率", "模型上线时间与支持广度", "企业客户留存和 SLA", "多云调度与容量稳定性"],
    conclusion: "判断推理公司的关键，不是问它是否拥有“独家 GPU”，而是问：同样一块 GPU、同样一个模型，它能否用更低成本、更低尾延迟和更高可靠性完成更多真实任务。",
    sourceNote: "本页为公开版研究摘要，整理自 2026 年 7 月完成的推理公司研究档案；已移除内部讨论、第三方付费材料与未公开数据。",
    accent: "violet",
  },
  {
    slug: "voice-ai",
    category: "AI APPLICATION STACK",
    date: "JUL 2026",
    title: "Voice AI 全技术路径与公司图谱",
    englishTitle: "Voice AI: Full Stack and Company Landscape",
    deck: "一通自然的 AI 电话背后，是音频前端、ASR、轮次判断、LLM、工具调用、TTS 与企业系统共同组成的实时分布式系统。",
    thesis: "Voice Agent 的价值不取决于单一模型是否“像真人”，而取决于整个系统能否在低延迟下正确听懂、做对决策、完成工具调用，并在异常和合规边界内安全退出。",
    insights: [
      {
        number: "01",
        title: "商业主流仍是级联式架构",
        body: "Speech → ASR → LLM → TTS 的架构便于替换模型、接入 RAG 和工具、保留文本审计记录。它的代价是各环节延迟叠加，并损失部分非文本语音信息。",
      },
      {
        number: "02",
        title: "轮次与打断是最容易被低估的环节",
        body: "系统必须区分真正的插话、附和、背景人声与回声。仅依靠静音阈值容易抢话或长时间沉默，语义端点和双边对话管理成为重要方向。",
      },
      {
        number: "03",
        title: "全双工 Speech-to-Speech 是前沿而非默认答案",
        body: "直接语音模型能保留情绪、重叠和 backchannel，但在事实性、工具调用、可控性、推理成本与审计方面仍需成熟。企业部署更可能长期采用混合架构。",
      },
      {
        number: "04",
        title: "垂直场景的系统执行层更接近价值终点",
        body: "医疗、保险、汽车经销和金融等场景的壁垒，来自身份验证、权限、工作流、写回系统与责任边界，而不仅是对话自然度。",
      },
    ],
    watch: ["端到端响应延迟与打断恢复", "实体识别错误率", "任务完成率和人工转接率", "工具调用成功率", "合规、可观测性与故障降级"],
    conclusion: "评估 Voice AI 时，应先判断公司控制的是模型、编排平台还是行业工作流，再选择对应指标。把所有公司放在同一个“语音 Agent”篮子里，往往会误判竞争关系。",
    sourceNote: "本页为公开版研究摘要，源自对 Voice AI 技术路径和 33 家公司的系统梳理。完整档案包含技术参考与更细的公司分层。",
    accent: "violet",
  },
  {
    slug: "memory-hbm",
    category: "AI HARDWARE & MARKETS",
    date: "JUN 2026",
    title: "内存、HBM 与 AI 系统瓶颈",
    englishTitle: "Memory, HBM and the AI System Bottleneck",
    deck: "AI 推理不只是拉动更多芯片：它正在改变服务器的内存含量、带宽结构、封装方式，以及 DRAM 与 NAND 的产业经济性。",
    thesis: "在传统服务器里，内存常被视为周期性组件；在 AI 系统里，内存带宽、容量与数据移动直接决定加速器能否被充分利用。内存因而从 BOM 项目升级为系统性能约束。",
    insights: [
      {
        number: "01",
        title: "HBM 的价值来自带宽与封装协同",
        body: "HBM 通过堆叠和超宽接口缩短数据路径，但其供给同时依赖 DRAM 工艺、TSV、先进封装、基板与测试良率。名义晶圆产能并不等于有效供给。",
      },
      {
        number: "02",
        title: "推理让容量与带宽同时变得重要",
        body: "模型权重、KV Cache、长上下文与并发请求共同占用显存和系统内存。推理规模化会同时拉动 HBM、服务器 DRAM 与企业级 SSD。",
      },
      {
        number: "03",
        title: "这轮周期需要拆分多种 TAM 口径",
        body: "总存储市场、DRAM、NAND、HBM 与 AI 服务器内存并不是可直接相加的同一口径。研究必须区分收入、bit 出货、容量含量与价值量。",
      },
      {
        number: "04",
        title: "价格上行不等于结构改善永久化",
        body: "HBM mix、传统 DRAM/NAND 供给纪律与资本开支决定盈利持续性。需要把 AI 的结构增量与库存、合约价和供给周期分别建模。",
      },
    ],
    watch: ["HBM 代际、客户认证与良率", "DRAM / NAND bit 供给增速", "AI 服务器内存与 SSD 含量", "先进封装产能", "库存、合约价与资本开支"],
    conclusion: "AI 对内存行业的影响既是结构性的，也是周期性的。最好的研究框架不是选择其中一个叙事，而是把产品 mix、有效供给和服务器架构放进同一张量化表里。",
    sourceNote: "本页为 2026 年 6 月内存市场全景研究的公开摘要，聚焦原创框架；具体预测与第三方付费研究引用未在公开版展示。",
    accent: "cyan",
  },
  {
    slug: "optical-cpo",
    category: "AI NETWORKING & MARKETS",
    date: "JUL 2026",
    title: "光互联与 CPO：当带宽成为稀缺资源",
    englishTitle: "Optical Interconnects and CPO",
    deck: "集群规模上升后，计算芯片之间的数据移动开始决定训练效率与推理成本，价值链从交换芯片延伸到激光器、DSP、光引擎、模块与光路交换。",
    thesis: "AI 网络的核心问题，是在功耗、距离、可靠性和可维护性之间寻找新的平衡。可插拔光模块仍会长期存在，而 CPO、LPO 与 OCS 将在特定场景逐步进入系统架构。",
    insights: [
      {
        number: "01",
        title: "Scale-up 与 Scale-out 需要不同的互联逻辑",
        body: "机内与机柜内互联更强调极低延迟和高带宽密度，跨机柜网络则更看重距离、拓扑、故障域与可维护性。不能用一个技术路线覆盖全部链路。",
      },
      {
        number: "02",
        title: "速率升级会重分配价值量",
        body: "从 800G 到 1.6T，光器件性能、DSP、散热、封装与测试难度同时上升。领先不仅来自产品规格，也来自良率、客户认证和大规模交付。",
      },
      {
        number: "03",
        title: "CPO 的优势与挑战来自同一个位置变化",
        body: "把光引擎靠近交换 ASIC 能降低电通道功耗并提高带宽密度，但也把光学可靠性、维修和热管理带进更复杂的系统边界。",
      },
      {
        number: "04",
        title: "OCS 提供另一种网络资源调度方式",
        body: "光路交换可在特定数据中心拓扑中降低电交换层级和功耗，但部署价值取决于流量模式、重构速度、控制软件和故障管理。",
      },
    ],
    watch: ["800G / 1.6T 出货结构", "EML、CW laser 与硅光供给", "CPO / LPO 客户验证", "模块良率和海外产能", "客户集中与技术路线变化"],
    conclusion: "光互联不是一个单纯的速率升级故事。真正的投资研究应从集群拓扑出发，判断不同链路需要什么器件、价值量落在哪里，以及哪家公司能把技术能力转化为稳定交付。",
    sourceNote: "本页综合 AI 产业链、CPO 公司库与光通信个股研究形成公开摘要，不包含目标价、内部估值或非公开交流内容。",
    accent: "amber",
  },
];

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) return {};
  return {
    title: `${article.englishTitle} — Eric Wang`,
    description: article.deck,
  };
}

export default async function ResearchArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();

  return (
    <main className={`article-shell article-${article.accent}`}>
      <header className="article-header">
        <Link className="wordmark" href="/">
          <span>EW</span><i /><small>ERIC WANG</small>
        </Link>
        <Link href="/#research">← BACK TO RESEARCH</Link>
      </header>

      <article>
        <section className="article-hero">
          <div className="article-kicker">
            <span>{article.category}</span>
            <i />
            <span>{article.date}</span>
          </div>
          <h1>{article.title}</h1>
          <h2>{article.englishTitle}</h2>
          <p>{article.deck}</p>
          <div className="article-signal" aria-hidden="true">
            <span>RESEARCH NOTE</span>
            <i /><i /><i /><i /><i />
          </div>
        </section>

        <section className="article-thesis">
          <span>CORE THESIS / 核心判断</span>
          <p>{article.thesis}</p>
        </section>

        <section className="article-insights">
          {article.insights.map((insight) => (
            <div key={insight.number}>
              <span>{insight.number}</span>
              <h3>{insight.title}</h3>
              <p>{insight.body}</p>
            </div>
          ))}
        </section>

        <section className="article-watch">
          <div>
            <span>MONITORING FRAMEWORK</span>
            <h2>接下来该跟踪什么？</h2>
          </div>
          <ol>
            {article.watch.map((item, index) => (
              <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>
            ))}
          </ol>
        </section>

        <section className="article-conclusion">
          <span>FINAL VIEW</span>
          <p>{article.conclusion}</p>
        </section>

        <footer className="article-footer">
          <p>{article.sourceNote}</p>
          <p>Research synthesis by Eric Wang · For discussion, not investment advice.</p>
          <div>
            <a href="mailto:wangyidong020321@gmail.com">EMAIL ↗</a>
            <a href="https://www.linkedin.com/in/eric-wangyidong/" target="_blank" rel="noreferrer">LINKEDIN ↗</a>
          </div>
        </footer>
      </article>
    </main>
  );
}
