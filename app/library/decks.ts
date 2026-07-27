export type ResearchDeck = {
  slug: string;
  title: string;
  chineseTitle: string;
  category: string;
  summary: string;
  pages: number;
  folder: string;
  accent: "teal" | "blue" | "orange";
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
];

export function deckPageSource(deck: ResearchDeck, page: number) {
  return `/readings/${deck.folder}/page-${String(page).padStart(2, "0")}.avif`;
}
