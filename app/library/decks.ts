export type ResearchDeck = {
  slug: string;
  title: string;
  chineseTitle: string;
  category: string;
  summary: string;
  chineseSummary?: string;
  pages: number;
  folder: string;
  chineseFolder?: string;
  accent: "teal" | "blue" | "orange";
  samples?: Array<{
    title: { en: string; zh: string };
    description: { en: string; zh: string };
    meta: { en: string; zh: string };
    src: string;
    poster: string;
  }>;
};

export const researchDecks: ResearchDeck[] = [
  {
    slug: "llm-agent-three-layers",
    title: "The Three Layers of LLM Agents",
    chineseTitle: "LLM Agent 的三层结构",
    category: "AGENT ARCHITECTURE",
    summary:
      "A field guide to reasoning, single-agent execution and orchestration—and how the three layers stack without competing.",
    pages: 13,
    folder: "llm-agent-three-layers",
    accent: "teal",
  },
  {
    slug: "agent-harness",
    title: "Agents & Harnesses",
    chineseTitle: "Agent 与 Harness",
    category: "AGENT SYSTEMS",
    summary:
      "The mental model, autonomy ladder, layered architecture, recurring patterns, security boundaries and cost controls behind production agents.",
    pages: 19,
    folder: "agent-harness",
    accent: "blue",
  },
  {
    slug: "agent-sandbox",
    title: "Sandbox, Docker & Virtual Machines",
    chineseTitle: "Agent Sandbox 架构",
    category: "SECURE EXECUTION",
    summary:
      "A visual explanation of runtime packaging, kernel boundaries, least privilege and the layered isolation used by real agent systems.",
    pages: 11,
    folder: "agent-sandbox",
    accent: "orange",
  },
  {
    slug: "kimi-k3-deployment",
    title: "Kimi K3: Architecture to Real Hardware",
    chineseTitle: "Kimi K3 架构与硬件部署",
    category: "MODEL × HARDWARE",
    summary:
      "From weights, activations and MXFP precision to KDA, Gated MLA, AttnRes, LatentMoE, accelerator parallelism and rack-scale economics.",
    pages: 42,
    folder: "kimi-k3-deployment",
    accent: "blue",
  },
  {
    slug: "xiaoyunque-short-drama-workflow",
    title: "From One Line to Short-Drama Video",
    chineseTitle: "一句话如何变成短剧视频",
    category: "AI VIDEO WORKFLOW",
    summary:
      "A tested production workflow that separates script confirmation, reusable visual assets and clip-based video generation—with clear notes on the public CLI, reference-video control and cloud boundaries.",
    chineseSummary:
      "一套经过实际项目验证的制作流程：把剧本确认、可复用视觉资产和分片段视频生成分开，同时说清公开 CLI、参考视频控制与云端能力的边界。",
    pages: 46,
    folder: "xiaoyunque-workflow-en",
    chineseFolder: "xiaoyunque-workflow-zh",
    accent: "blue",
    samples: [
      {
        title: { en: "Episode 1 · Death Recall", zh: "第 1 集 · 死亡回溯" },
        description: {
          en: "The pure-blood natural human strikes back.",
          zh: "纯血自然人的反击。",
        },
        meta: { en: "2:02 · 720p source", zh: "2:02 · 720p 源成片" },
        src: "/videos/xiaoyunque/death-recall.mp4",
        poster: "/videos/xiaoyunque/death-recall.jpg",
      },
      {
        title: { en: "Episode 2 · Format Countdown", zh: "第 2 集 · 格式化倒计时" },
        description: {
          en: "An alliance formed at the edge of a deadlock.",
          zh: "绝境中结成的临时联盟。",
        },
        meta: { en: "1:39 · 720p source", zh: "1:39 · 720p 源成片" },
        src: "/videos/xiaoyunque/format-countdown.mp4",
        poster: "/videos/xiaoyunque/format-countdown.jpg",
      },
      {
        title: { en: "Reference-video remake", zh: "参考视频重制样例" },
        description: {
          en: "A localized visual remake built from a segmented reference-video workflow; the source clip is not republished here.",
          zh: "通过参考视频分片和本地化视觉替换生成；此处不重新发布原始参考片段。",
        },
        meta: { en: "2:29 · remake output", zh: "2:29 · 重制成片" },
        src: "/videos/xiaoyunque/reference-remake.mp4",
        poster: "/videos/xiaoyunque/reference-remake.jpg",
      },
    ],
  },
];

export function deckPageSource(deck: ResearchDeck, page: number) {
  return `/readings/${deck.folder}/page-${String(page).padStart(2, "0")}.avif`;
}
