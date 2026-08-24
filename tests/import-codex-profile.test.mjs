import assert from "node:assert/strict";
import test from "node:test";
import { mapOfficialProfile } from "../scripts/import-codex-profile.mjs";

test("maps the official profile fields without local token estimation", () => {
  const result = mapOfficialProfile({
    profile: { display_name: " Eric ", username: "ericwang0321" },
    stats: {
      lifetime_tokens: 18_043_210_000,
      peak_daily_tokens: 1_683_000_000,
      longest_running_turn_sec: 57_300,
      current_streak_days: 4,
      longest_streak_days: 20,
      daily_usage_buckets: [{ start_date: "2026-08-24", tokens: 123 }],
      fast_mode_usage_percentage: 38,
      most_used_reasoning_effort: "xhigh",
      most_used_reasoning_effort_percentage: 36,
      unique_skills_used: 71,
      total_skills_used: 2_198,
      total_threads: 4_772,
      top_invocations: [
        { type: "plugin", plugin_name: "spreadsheets", usage_count: 502 },
        { type: "skill", skill_name: "company-model-harness", usage_count: 174 },
      ],
    },
  }, { profile: { plan: "Pro", imageUrl: "/eric.png" } }, "2026-08-24");

  assert.equal(result.summary.totalTextTokens, 18_043_210_000);
  assert.equal(result.summary.peakTokens, 1_683_000_000);
  assert.equal(result.summary.longestTaskDurationMs, 57_300_000);
  assert.equal(result.activityInsights.totalThreads, 4_772);
  assert.deepEqual(result.dailyUsage, [{ date: "2026-08-24", credits: 123 }]);
  assert.deepEqual(result.activityInsights.invocations, [
    { type: "plugin", pluginName: "spreadsheets", usageCount: 502 },
    { type: "skill", skillName: "company-model-harness", usageCount: 174 },
  ]);
});

test("rejects data that is not a /wham/profiles/me response", () => {
  assert.throws(() => mapOfficialProfile({ stats: {} }), /wham\/profiles\/me/);
});
