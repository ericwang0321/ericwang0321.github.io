#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { mkdir, readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TIME_ZONE = "Asia/Hong_Kong";
const CACHE_VERSION = 5;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const codexLogRoot = process.env.CODEX_USAGE_LOG_ROOT || path.join(homedir(), ".codex");
const sourceRoots = [
  path.join(codexLogRoot, "sessions"),
  path.join(codexLogRoot, "archived_sessions"),
];
const localDataRoot = path.join(projectRoot, "local-data", "codex-usage");
const cachePath = path.join(localDataRoot, "file-cache.json");
const snapshotRoot = path.join(localDataRoot, "snapshots");
const publicDataPath = path.join(projectRoot, "public", "data", "codex-usage.json");

const emptyUsage = () => ({
  inputTokens: 0,
  cachedInputTokens: 0,
  uncachedInputTokens: 0,
  cacheWriteInputTokens: 0,
  outputTokens: 0,
  reasoningOutputTokens: 0,
  totalTokens: 0,
  requests: 0,
});

const emptyActivity = () => ({
  toolCounts: {},
  skillCounts: {},
  reasoningCounts: {},
  serviceTierCounts: {},
  maxChatSeconds: 0,
});

const incrementCount = (counts, name) => {
  counts[name] = (counts[name] || 0) + 1;
};

const numeric = (value) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

const dateInTimeZone = (value) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};

const shiftDate = (date, days) => {
  const shifted = new Date(`${date}T00:00:00.000Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
};

const dateRange = (start, end) => {
  const dates = [];
  for (let cursor = start; cursor <= end; cursor = shiftDate(cursor, 1)) dates.push(cursor);
  return dates;
};

const collectJsonlFiles = async (root) => {
  const files = [];
  const visit = async (directory) => {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(entryPath);
      if (entry.isFile() && entry.name.endsWith(".jsonl")) files.push(entryPath);
    }
  };
  await visit(root);
  return files;
};

const readCache = async () => {
  try {
    const cache = JSON.parse(await readFile(cachePath, "utf8"));
    if (cache.version === CACHE_VERSION && cache.files) return cache;
  } catch {
    // A missing or outdated cache is rebuilt from the local session logs.
  }
  return { version: CACHE_VERSION, files: {} };
};

const writeJsonAtomic = async (targetPath, value, compact = false) => {
  await mkdir(path.dirname(targetPath), { recursive: true });
  const temporaryPath = `${targetPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, compact ? 0 : 2)}\n`, "utf8");
  await rename(temporaryPath, targetPath);
};

const scanFiles = async (files) => {
  const perFile = new Map(files.map((file) => [file, {
    daily: {}, activityDaily: {}, previous: emptyUsage(), lastTokenTimestamp: null, currentChatSeconds: 0, invalidLines: 0,
  }]));
  if (files.length === 0) return perFile;

  const batchSize = 72;
  for (let start = 0; start < files.length; start += batchSize) {
    const batch = files.slice(start, start + batchSize);
    const child = spawn("rg", [
      "--json", "--no-messages",
      "-e", '"type":"token_count"',
      "-e", '"type":"function_call"',
      "-e", '"type":"turn_context"',
      "-e", '"thread_settings"',
      ...batch,
    ], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    const exitPromise = new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("close", resolve);
    });
    const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });

    for await (const outputLine of lines) {
      let match;
      try {
        match = JSON.parse(outputLine);
      } catch {
        continue;
      }
      if (match.type !== "match") continue;
      const file = match.data?.path?.text;
      const rawLine = match.data?.lines?.text?.trim();
      const fileState = perFile.get(file);
      if (!fileState || !rawLine) continue;

      let event;
      try {
        event = JSON.parse(rawLine);
      } catch {
        fileState.invalidLines += 1;
        continue;
      }
      if (event?.type === "turn_context" && event.timestamp) {
        const effort = typeof event.payload?.effort === "string" ? event.payload.effort : "";
        if (/^[A-Za-z0-9_-]{1,40}$/.test(effort)) {
          const date = dateInTimeZone(event.timestamp);
          const activity = fileState.activityDaily[date] || emptyActivity();
          incrementCount(activity.reasoningCounts, effort);
          fileState.activityDaily[date] = activity;
        }
        continue;
      }
      if (event?.type === "event_msg" && event.timestamp) {
        const serviceTier = event.payload?.thread_settings?.service_tier;
        if (typeof serviceTier === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(serviceTier)) {
          const date = dateInTimeZone(event.timestamp);
          const activity = fileState.activityDaily[date] || emptyActivity();
          incrementCount(activity.serviceTierCounts, serviceTier);
          fileState.activityDaily[date] = activity;
          continue;
        }
      }
      if (event?.payload?.type === "function_call" && event.timestamp) {
        const toolName = typeof event.payload.name === "string" ? event.payload.name : "";
        if (!/^[A-Za-z0-9_.:-]{1,120}$/.test(toolName)) continue;
        const date = dateInTimeZone(event.timestamp);
        const activity = fileState.activityDaily[date] || emptyActivity();
        incrementCount(activity.toolCounts, toolName);

        const args = typeof event.payload.arguments === "string" ? event.payload.arguments : "";
        if (args.includes("SKILL.md")) {
          const skillNames = new Set(
            [...args.matchAll(/(?:^|\/)([A-Za-z0-9][A-Za-z0-9._-]*)\/SKILL\.md/g)].map((match) => match[1]),
          );
          for (const skillName of skillNames) incrementCount(activity.skillCounts, skillName);
        }
        fileState.activityDaily[date] = activity;
        continue;
      }
      if (event?.payload?.type !== "token_count") continue;
      const total = event.payload?.info?.total_token_usage;
      if (!total || !event.timestamp) continue;

      const currentInput = numeric(total.input_tokens);
      const currentOutput = numeric(total.output_tokens);
      const current = {
        inputTokens: currentInput,
        cachedInputTokens: numeric(total.cached_input_tokens),
        cacheWriteInputTokens: numeric(total.cache_write_input_tokens),
        outputTokens: currentOutput,
        reasoningOutputTokens: numeric(total.reasoning_output_tokens),
        // Some Codex versions added one context-window allowance to total_tokens.
        // Input + output is stable across versions and matches the chart's stacked bars.
        totalTokens: currentInput + currentOutput,
      };
      const reset = Object.keys(current).some((key) => current[key] < fileState.previous[key]);
      const baseline = reset ? emptyUsage() : fileState.previous;
      const delta = {
        inputTokens: current.inputTokens - baseline.inputTokens,
        cachedInputTokens: current.cachedInputTokens - baseline.cachedInputTokens,
        cacheWriteInputTokens: current.cacheWriteInputTokens - baseline.cacheWriteInputTokens,
        outputTokens: current.outputTokens - baseline.outputTokens,
        reasoningOutputTokens: current.reasoningOutputTokens - baseline.reasoningOutputTokens,
        totalTokens: current.totalTokens - baseline.totalTokens,
      };
      fileState.previous = { ...fileState.previous, ...current };
      if (delta.inputTokens === 0 && delta.outputTokens === 0 && delta.totalTokens === 0) continue;

      const date = dateInTimeZone(event.timestamp);
      const day = fileState.daily[date] || emptyUsage();
      const timestamp = Date.parse(event.timestamp);
      if (Number.isFinite(timestamp) && fileState.lastTokenTimestamp !== null) {
        const gapSeconds = Math.max(0, (timestamp - fileState.lastTokenTimestamp) / 1000);
        if (gapSeconds <= 10 * 60) {
          fileState.currentChatSeconds += gapSeconds;
          const activity = fileState.activityDaily[date] || emptyActivity();
          activity.maxChatSeconds = Math.max(activity.maxChatSeconds, fileState.currentChatSeconds);
          fileState.activityDaily[date] = activity;
        } else {
          fileState.currentChatSeconds = 0;
        }
      }
      if (Number.isFinite(timestamp)) fileState.lastTokenTimestamp = timestamp;
      day.inputTokens += delta.inputTokens;
      day.cachedInputTokens += Math.min(delta.inputTokens, delta.cachedInputTokens);
      day.cacheWriteInputTokens += delta.cacheWriteInputTokens;
      day.outputTokens += delta.outputTokens;
      day.reasoningOutputTokens += Math.min(delta.outputTokens, delta.reasoningOutputTokens);
      day.totalTokens += delta.inputTokens + delta.outputTokens;
      day.requests += 1;
      day.uncachedInputTokens = Math.max(0, day.inputTokens - day.cachedInputTokens);
      fileState.daily[date] = day;
    }

    const exitCode = await exitPromise;
    if (exitCode !== 0 && exitCode !== 1) throw new Error(`rg exited with status ${exitCode}`);
  }

  return perFile;
};

const sumUsage = (target, source) => {
  for (const key of [
    "inputTokens",
    "cachedInputTokens",
    "uncachedInputTokens",
    "cacheWriteInputTokens",
    "outputTokens",
    "reasoningOutputTokens",
    "totalTokens",
    "requests",
  ]) target[key] += numeric(source[key]);
};

const percentChange = (current, previous) => previous > 0
  ? Number((((current - previous) / previous) * 100).toFixed(1))
  : null;

const main = async () => {
  const args = new Set(process.argv.slice(2));
  const explicitThrough = process.argv.find((argument) => argument.startsWith("--through="))?.split("=")[1];
  const today = dateInTimeZone(new Date());
  const throughDate = explicitThrough || (args.has("--include-today") ? today : shiftDate(today, -1));

  const allFiles = (await Promise.all(sourceRoots.map(collectJsonlFiles))).flat().sort();
  const metadata = new Map();
  for (const file of allFiles) {
    const fileStat = await stat(file);
    metadata.set(file, { size: fileStat.size, mtimeMs: Math.round(fileStat.mtimeMs) });
  }

  const cache = await readCache();
  const presentFiles = new Set(allFiles);
  for (const cachedFile of Object.keys(cache.files)) {
    if (!presentFiles.has(cachedFile)) delete cache.files[cachedFile];
  }
  const changedFiles = allFiles.filter((file) => {
    const cached = cache.files[file];
    const current = metadata.get(file);
    return !cached || cached.size !== current.size || cached.mtimeMs !== current.mtimeMs;
  });

  const scanned = await scanFiles(changedFiles);
  for (const file of changedFiles) {
    const result = scanned.get(file);
    cache.files[file] = {
      ...metadata.get(file),
      daily: result?.daily || {},
      activityDaily: result?.activityDaily || {},
      invalidLines: result?.invalidLines || 0,
    };
  }
  cache.version = CACHE_VERSION;
  cache.updatedAt = new Date().toISOString();
  await writeJsonAtomic(cachePath, cache, true);

  const combined = {};
  const toolCounts = {};
  const skillCounts = {};
  const reasoningCounts = {};
  const serviceTierCounts = {};
  let sourceSessions = 0;
  let invalidLines = 0;
  let peakChatTokens = 0;
  let longestChatSeconds = 0;
  for (const file of Object.values(cache.files)) {
    let included = false;
    let fileTokens = 0;
    let fileActiveSeconds = 0;
    invalidLines += numeric(file.invalidLines);
    for (const [date, usage] of Object.entries(file.daily || {})) {
      if (date > throughDate) continue;
      const day = combined[date] || { ...emptyUsage(), sessions: 0 };
      sumUsage(day, usage);
      day.sessions += 1;
      day.uncachedInputTokens = Math.max(0, day.inputTokens - day.cachedInputTokens);
      combined[date] = day;
      fileTokens += numeric(usage.totalTokens);
      included = true;
    }
    for (const [date, activity] of Object.entries(file.activityDaily || {})) {
      if (date > throughDate) continue;
      for (const [name, count] of Object.entries(activity.toolCounts || {})) toolCounts[name] = (toolCounts[name] || 0) + numeric(count);
      for (const [name, count] of Object.entries(activity.skillCounts || {})) skillCounts[name] = (skillCounts[name] || 0) + numeric(count);
      for (const [name, count] of Object.entries(activity.reasoningCounts || {})) reasoningCounts[name] = (reasoningCounts[name] || 0) + numeric(count);
      for (const [name, count] of Object.entries(activity.serviceTierCounts || {})) serviceTierCounts[name] = (serviceTierCounts[name] || 0) + numeric(count);
      fileActiveSeconds = Math.max(fileActiveSeconds, numeric(activity.maxChatSeconds));
    }
    if (included) {
      sourceSessions += 1;
      peakChatTokens = Math.max(peakChatTokens, fileTokens);
      longestChatSeconds = Math.max(longestChatSeconds, fileActiveSeconds);
    }
  }

  const activeDates = Object.keys(combined).filter((date) => combined[date].totalTokens > 0).sort();
  if (activeDates.length === 0) throw new Error("No Codex token_count events were found in the selected date range.");
  const firstDate = activeDates[0];
  const daily = dateRange(firstDate, throughDate).map((date) => {
    const usage = combined[date] || { ...emptyUsage(), sessions: 0 };
    return {
      date,
      ...usage,
      cacheHitRate: usage.inputTokens > 0
        ? Number(((usage.cachedInputTokens / usage.inputTokens) * 100).toFixed(1))
        : 0,
    };
  });

  const totals = { ...emptyUsage(), sessions: sourceSessions };
  for (const day of daily) sumUsage(totals, day);
  totals.uncachedInputTokens = Math.max(0, totals.inputTokens - totals.cachedInputTokens);
  totals.cacheHitRate = totals.inputTokens > 0
    ? Number(((totals.cachedInputTokens / totals.inputTokens) * 100).toFixed(1))
    : 0;

  const lastSeven = daily.slice(-7).reduce((sum, day) => sum + day.totalTokens, 0);
  const previousSeven = daily.slice(-14, -7).reduce((sum, day) => sum + day.totalTokens, 0);
  const peakDay = daily.reduce((peak, day) => day.totalTokens > peak.totalTokens ? day : peak, daily[0]);
  const activeDayCount = daily.filter((day) => day.totalTokens > 0).length;
  let currentStreak = 0;
  for (let index = daily.length - 1; index >= 0 && daily[index].totalTokens > 0; index -= 1) currentStreak += 1;
  let longestStreak = 0;
  let runningStreak = 0;
  for (const day of daily) {
    runningStreak = day.totalTokens > 0 ? runningStreak + 1 : 0;
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  const output = {
    schemaVersion: 3,
    generatedAt: new Date().toISOString(),
    timezone: TIME_ZONE,
    throughDate,
    source: {
      firstDate,
      filesIndexed: allFiles.length,
      sessionsWithUsage: sourceSessions,
      invalidTokenLines: invalidLines,
      contentRead: false,
    },
    totals,
    summary: {
      calendarDays: daily.length,
      activeDays: activeDayCount,
      averagePerActiveDay: activeDayCount > 0 ? Math.round(totals.totalTokens / activeDayCount) : 0,
      lastSevenDaysTokens: lastSeven,
      previousSevenDaysTokens: previousSeven,
      sevenDayChangePercent: percentChange(lastSeven, previousSeven),
      peakDate: peakDay.date,
      peakTokens: peakDay.totalTokens,
      peakChatTokens,
      longestChatSeconds: Math.round(longestChatSeconds),
      currentStreak,
      longestStreak,
    },
    behavior: {
      fastModePercent: (numeric(serviceTierCounts.priority) + numeric(serviceTierCounts.default)) > 0
        ? Number(((numeric(serviceTierCounts.priority) / (numeric(serviceTierCounts.priority) + numeric(serviceTierCounts.default))) * 100).toFixed(1))
        : 0,
      reasoningLabel: "极高",
      reasoningPercent: Object.values(reasoningCounts).reduce((sum, count) => sum + numeric(count), 0) > 0
        ? Number((((numeric(reasoningCounts.high) + numeric(reasoningCounts.xhigh) + numeric(reasoningCounts.ultra)) / Object.values(reasoningCounts).reduce((sum, count) => sum + numeric(count), 0)) * 100).toFixed(1))
        : 0,
    },
    activity: {
      toolCalls: Object.values(toolCounts).reduce((sum, count) => sum + count, 0),
      uniqueTools: Object.keys(toolCounts).length,
      skillReads: Object.values(skillCounts).reduce((sum, count) => sum + count, 0),
      uniqueSkills: Object.keys(skillCounts).length,
      topTools: Object.entries(toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name, count]) => ({ name, count })),
      topSkills: Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name, count]) => ({ name, count })),
      topPlugins: [
        { name: "spreadsheets", count: numeric(skillCounts.spreadsheets) },
        { name: "presentations", count: Object.entries(skillCounts).filter(([name]) => /presentation|pptx|slide|pitch-deck|deck-refresh|ib-check-deck/.test(name)).reduce((sum, [, count]) => sum + numeric(count), 0) },
        { name: "company-model-harness", count: numeric(skillCounts["company-model-harness"]) },
        { name: "documents", count: Object.entries(skillCounts).filter(([name]) => /document|pdf/.test(name)).reduce((sum, [, count]) => sum + numeric(count), 0) },
        { name: "sites", count: Object.entries(skillCounts).filter(([name]) => /site|browser/.test(name)).reduce((sum, [, count]) => sum + numeric(count), 0) },
      ].filter((item) => item.count > 0),
    },
    daily,
  };

  await writeJsonAtomic(publicDataPath, output);
  await writeJsonAtomic(path.join(snapshotRoot, `${throughDate}.json`), output);

  console.log(`Codex usage updated through ${throughDate}.`);
  console.log(`Indexed ${allFiles.length} files (${changedFiles.length} changed); ${daily.length} calendar days; ${totals.totalTokens.toLocaleString("en-US")} tokens.`);
};

await main();
