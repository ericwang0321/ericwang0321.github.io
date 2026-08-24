import type { Metadata } from "next";
import profileData from "@/public/data/codex-profile.json";
import usageData from "@/public/data/codex-usage.json";
import UsageDashboard from "./UsageDashboard";
import type { CodexProfileData, UsageData } from "./types";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Eric — Codex Profile",
  description: "Eric's Codex activity profile.",
  robots: { index: false, follow: false },
};

export default function CodexUsagePage() {
  return <UsageDashboard profile={profileData as CodexProfileData} usage={usageData as UsageData} />;
}
