import type { Metadata } from "next";
import usageData from "@/public/data/codex-usage.json";
import UsageDashboard from "./UsageDashboard";
import type { UsageData } from "./types";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Codex Usage — Eric Wang",
  description: "A local-first view of daily Codex token usage, cache efficiency and activity trends.",
  robots: { index: false, follow: false },
};

export default function CodexUsagePage() {
  return <UsageDashboard data={usageData as UsageData} />;
}
