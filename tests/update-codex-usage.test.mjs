import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { advanceCumulativeUsage, isInheritedSubagentBootstrapEvent, scanFiles } from "../scripts/update-codex-usage.mjs";

const tokenEvent = (timestamp, input, output, cached = 0) => JSON.stringify({
  timestamp,
  type: "event_msg",
  payload: {
    type: "token_count",
    info: {
      total_token_usage: {
        input_tokens: input,
        cached_input_tokens: cached,
        output_tokens: output,
      },
    },
  },
});

test("only classifies the subagent initialization window as inherited", () => {
  const sessionStartedAt = Date.parse("2026-08-10T13:40:03.107Z");
  assert.equal(isInheritedSubagentBootstrapEvent({
    eventTimestamp: "2026-08-10T13:40:03.180Z",
    importedHistory: true,
    sessionStartedAt,
    threadSource: "subagent",
  }), true);
  assert.equal(isInheritedSubagentBootstrapEvent({
    eventTimestamp: "2026-08-10T13:40:07.500Z",
    importedHistory: true,
    sessionStartedAt,
    threadSource: "subagent",
  }), true);
  assert.equal(isInheritedSubagentBootstrapEvent({
    eventTimestamp: "2026-08-10T13:40:16.275Z",
    importedHistory: true,
    sessionStartedAt,
    threadSource: "subagent",
  }), false);
  assert.equal(isInheritedSubagentBootstrapEvent({
    eventTimestamp: "2026-08-10T13:40:03.180Z",
    importedHistory: true,
    sessionStartedAt,
    threadSource: "cli",
  }), false);
  assert.equal(isInheritedSubagentBootstrapEvent({
    eventTimestamp: "2026-08-10T13:40:03.180Z",
    importedHistory: false,
    sessionStartedAt,
    threadSource: "subagent",
  }), false);
});

test("keeps cumulative counters at their high-water marks", () => {
  const first = advanceCumulativeUsage(
    { inputTokens: 0, cachedInputTokens: 0, cacheWriteInputTokens: 0, outputTokens: 0, reasoningOutputTokens: 0 },
    { inputTokens: 1_000, cachedInputTokens: 800, cacheWriteInputTokens: 0, outputTokens: 100, reasoningOutputTokens: 40 },
  );
  const rollback = advanceCumulativeUsage(first.next, {
    inputTokens: 990,
    cachedInputTokens: 790,
    cacheWriteInputTokens: 0,
    outputTokens: 99,
    reasoningOutputTokens: 39,
  });
  const resumed = advanceCumulativeUsage(rollback.next, {
    inputTokens: 1_100,
    cachedInputTokens: 850,
    cacheWriteInputTokens: 0,
    outputTokens: 110,
    reasoningOutputTokens: 45,
  });

  assert.equal(first.delta.totalTokens, 1_100);
  assert.equal(rollback.delta.totalTokens, 0);
  assert.equal(resumed.delta.totalTokens, 110);
  assert.equal(resumed.delta.cachedInputTokens, 50);
  assert.equal(resumed.delta.reasoningOutputTokens, 5);
  assert.equal(resumed.next.totalTokens, 1_210);
});

test("does not re-add a session after a backward token snapshot", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "codex-usage-rollback-test-"));
  const sessionFile = path.join(directory, "regular.jsonl");

  try {
    await writeFile(sessionFile, [
      JSON.stringify({
        timestamp: "2026-08-10T13:40:02.989Z",
        type: "session_meta",
        payload: { timestamp: "2026-08-10T13:40:02.989Z", thread_source: "cli" },
      }),
      tokenEvent("2026-08-10T13:40:03.108Z", 1_000, 100, 800),
      tokenEvent("2026-08-10T13:40:04.108Z", 990, 99, 790),
      tokenEvent("2026-08-10T13:40:05.108Z", 1_100, 110, 850),
    ].join("\n"), "utf8");

    const scanned = await scanFiles([sessionFile]);
    const day = scanned.get(sessionFile).daily["2026-08-10"];
    assert.equal(day.inputTokens, 1_100);
    assert.equal(day.outputTokens, 110);
    assert.equal(day.totalTokens, 1_210);
    assert.equal(day.requests, 2);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("uses imported subagent counters as a baseline without counting them twice", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "codex-usage-test-"));
  const burstSubagentFile = path.join(directory, "burst-subagent.jsonl");
  const subagentFile = path.join(directory, "subagent.jsonl");
  const quickSubagentFile = path.join(directory, "quick-subagent.jsonl");
  const regularFile = path.join(directory, "regular.jsonl");

  try {
    await writeFile(subagentFile, [
      JSON.stringify({
        timestamp: "2026-08-10T13:40:03.107Z",
        type: "session_meta",
        payload: { timestamp: "2026-08-10T13:40:02.989Z", thread_source: "subagent" },
      }),
      JSON.stringify({
        timestamp: "2026-08-10T13:40:03.107Z",
        type: "session_meta",
        payload: { timestamp: "2026-08-02T08:58:16.072Z", thread_source: "subagent" },
      }),
      tokenEvent("2026-08-10T13:40:03.108Z", 80, 20, 60),
      JSON.stringify({
        timestamp: "2026-08-10T13:40:03.109Z",
        type: "event_msg",
        payload: { type: "function_call", name: "copied_parent_tool", arguments: "{}" },
      }),
      tokenEvent("2026-08-10T13:40:03.180Z", 160, 40, 120),
      tokenEvent("2026-08-10T13:40:16.275Z", 210, 50, 150),
    ].join("\n"), "utf8");

    await writeFile(regularFile, [
      JSON.stringify({
        timestamp: "2026-08-10T13:40:02.989Z",
        type: "session_meta",
        payload: { timestamp: "2026-08-10T13:40:02.989Z", thread_source: "cli" },
      }),
      tokenEvent("2026-08-10T13:40:03.108Z", 80, 20, 60),
    ].join("\n"), "utf8");

    await writeFile(quickSubagentFile, [
      JSON.stringify({
        timestamp: "2026-08-10T13:40:03.107Z",
        type: "session_meta",
        payload: { timestamp: "2026-08-10T13:40:02.989Z", thread_source: "subagent" },
      }),
      tokenEvent("2026-08-10T13:40:05.108Z", 80, 20, 60),
    ].join("\n"), "utf8");

    await writeFile(burstSubagentFile, [
      JSON.stringify({
        timestamp: "2026-08-10T13:40:03.107Z",
        type: "session_meta",
        payload: { timestamp: "2026-08-10T13:40:02.989Z", thread_source: "subagent" },
      }),
      tokenEvent("2026-08-10T13:40:03.108Z", 80, 20, 60),
      tokenEvent("2026-08-10T13:40:03.108Z", 160, 40, 120),
      tokenEvent("2026-08-10T13:40:16.275Z", 210, 50, 150),
    ].join("\n"), "utf8");

    const scanned = await scanFiles([burstSubagentFile, subagentFile, quickSubagentFile, regularFile]);
    const burstSubagent = scanned.get(burstSubagentFile);
    const subagent = scanned.get(subagentFile);
    const quickSubagent = scanned.get(quickSubagentFile);
    const regular = scanned.get(regularFile);

    assert.equal(subagent.inheritedEventsSkipped, 3);
    assert.equal(subagent.inheritedTokenEventsSkipped, 2);
    assert.deepEqual(subagent.activityDaily, {});
    assert.equal(subagent.daily["2026-08-10"].inputTokens, 50);
    assert.equal(subagent.daily["2026-08-10"].outputTokens, 10);
    assert.equal(subagent.daily["2026-08-10"].totalTokens, 60);
    assert.equal(subagent.daily["2026-08-10"].requests, 1);
    assert.equal(burstSubagent.inheritedTokenEventsSkipped, 2);
    assert.equal(burstSubagent.daily["2026-08-10"].totalTokens, 60);
    assert.equal(quickSubagent.inheritedTokenEventsSkipped, 0);
    assert.equal(quickSubagent.daily["2026-08-10"].totalTokens, 100);
    assert.equal(regular.inheritedEventsSkipped, 0);
    assert.equal(regular.daily["2026-08-10"].totalTokens, 100);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
