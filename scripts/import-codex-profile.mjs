#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const OUTPUT_PATH = resolve("public/data/codex-profile.json");

const finiteNumber = (value, field) => {
  if (value == null) return 0;
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`Invalid numeric field: ${field}`);
  return Math.max(0, number);
};

const cleanText = (value) => typeof value === "string" && value.trim() ? value.trim() : undefined;

export function mapOfficialProfile(payload, existing = {}, todayIso = new Date().toISOString().slice(0, 10)) {
  if (!payload || typeof payload !== "object" || !payload.profile || !payload.stats) {
    throw new Error("Expected the JSON response from /wham/profiles/me");
  }

  const { profile, stats } = payload;
  const dailyUsage = Array.isArray(stats.daily_usage_buckets)
    ? stats.daily_usage_buckets.map((bucket, index) => ({
      date: cleanText(bucket?.start_date) ?? (() => { throw new Error(`Missing daily_usage_buckets[${index}].start_date`); })(),
      credits: finiteNumber(bucket?.tokens, `daily_usage_buckets[${index}].tokens`),
    }))
    : [];

  const invocations = Array.isArray(stats.top_invocations)
    ? stats.top_invocations.flatMap((invocation) => {
      if (invocation?.type !== "plugin" && invocation?.type !== "skill") return [];
      const pluginName = cleanText(invocation.plugin_name);
      const skillName = cleanText(invocation.skill_name);
      if (invocation.type === "plugin" && !pluginName) return [];
      if (invocation.type === "skill" && !skillName) return [];
      return [{
        type: invocation.type,
        ...(pluginName ? { pluginName } : {}),
        ...(skillName ? { skillName } : {}),
        usageCount: Math.round(finiteNumber(invocation.usage_count, "top_invocations.usage_count")),
      }];
    })
    : [];

  return {
    schemaVersion: 1,
    syncedAt: new Date().toISOString(),
    todayIso,
    source: {
      kind: "official-profile-snapshot",
      endpoint: "/wham/profiles/me",
      note: "Mapped directly from the authenticated Codex profile response; no local token-log estimation is used.",
    },
    profile: {
      displayName: cleanText(profile.display_name) ?? existing.profile?.displayName ?? "Eric",
      username: cleanText(profile.username) ?? existing.profile?.username ?? "ericwang0321",
      plan: existing.profile?.plan ?? "Pro",
      imageUrl: existing.profile?.imageUrl ?? "/eric.png",
    },
    summary: {
      totalTextTokens: finiteNumber(stats.lifetime_tokens, "lifetime_tokens"),
      peakTokens: finiteNumber(stats.peak_daily_tokens, "peak_daily_tokens"),
      longestTaskDurationMs: finiteNumber(stats.longest_running_turn_sec, "longest_running_turn_sec") * 1000,
      currentStreakDays: Math.round(finiteNumber(stats.current_streak_days, "current_streak_days")),
      longestStreakDays: Math.round(finiteNumber(stats.longest_streak_days, "longest_streak_days")),
    },
    activityInsights: {
      fastModePercent: finiteNumber(stats.fast_mode_usage_percentage, "fast_mode_usage_percentage"),
      reasoningEffort: cleanText(stats.most_used_reasoning_effort) ?? "—",
      reasoningEffortPercent: finiteNumber(stats.most_used_reasoning_effort_percentage, "most_used_reasoning_effort_percentage"),
      skillsExplored: Math.round(finiteNumber(stats.unique_skills_used, "unique_skills_used")),
      totalSkillsUsed: Math.round(finiteNumber(stats.total_skills_used, "total_skills_used")),
      totalThreads: Math.round(finiteNumber(stats.total_threads, "total_threads")),
      invocations,
    },
    dailyUsage,
  };
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) throw new Error("Usage: npm run profile:import -- /absolute/path/to/wham-profile.json [YYYY-MM-DD]");

  const [payloadText, existingText] = await Promise.all([
    readFile(resolve(inputPath), "utf8"),
    readFile(OUTPUT_PATH, "utf8").catch(() => "{}"),
  ]);
  const mapped = mapOfficialProfile(JSON.parse(payloadText), JSON.parse(existingText), process.argv[3]);
  await writeFile(OUTPUT_PATH, `${JSON.stringify(mapped, null, 2)}\n`, "utf8");
  console.log(`Updated ${OUTPUT_PATH} from the official Codex profile response.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
