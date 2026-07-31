"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./usage.module.css";
import type { DailyUsage, UsageData } from "./types";

type Language = "en" | "zh";
type ActivityView = "daily" | "weekly" | "lifetime";
type ActivityPeriod = { date: string; endDate?: string; totalTokens: number; inputTokens: number; cachedInputTokens: number; outputTokens: number };

const compactTokens = (value: number) => {
  const unit = value >= 1_000_000_000 ? "B" : value >= 1_000_000 ? "M" : value >= 1_000 ? "K" : "";
  const divisor = unit === "B" ? 1_000_000_000 : unit === "M" ? 1_000_000 : unit === "K" ? 1_000 : 1;
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: value / divisor >= 100 ? 0 : 1 }).format(value / divisor)}${unit}`;
};

const formatDate = (date: string, language: Language, includeYear = true) => new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
  ...(includeYear ? { year: "numeric" } : {}), month: "short", day: "numeric", timeZone: "UTC",
}).format(new Date(`${date}T00:00:00Z`));

const copy = {
  en: {
    title: "Eric's Codex activity", subtitle: "A local-first record of how Codex gets used.", total: "Total tokens", peak: "Peak-day tokens",
    current: "Current streak", longest: "Longest streak", toolCalls: "Tool calls", activity: "Token activity", daily: "Daily", weekly: "Weekly", lifetime: "Lifetime",
    insights: "Activity insights", sessions: "Sessions with usage", active: "Active days", cache: "Cache hit rate", uniqueTools: "Tools used", uniqueSkills: "Skills explored", skillReads: "Skill uses",
    topTools: "Most-used tools", topSkills: "Most-used skills", privacy: "Privacy by design", privacyText: "Published data contains timestamps, token counters, tool names, and Skill names only. Prompts, responses, arguments, files, and tool output stay private.",
    updated: "Complete through", days: "days", tokens: "tokens", input: "Input", cached: "Cached input", output: "Output", totalLabel: "Total", less: "Less", more: "More", weekOf: "Week of",
  },
  zh: {
    title: "Eric 的 Codex 活动", subtitle: "Codex 使用情况的本地优先记录。", total: "累计 Token 数", peak: "峰值单日 Token 数",
    current: "当前连续天数", longest: "最长连续天数", toolCalls: "工具调用总数", activity: "Token 活动", daily: "每日", weekly: "每周", lifetime: "累计",
    insights: "活动洞察", sessions: "有用量的会话", active: "活跃天数", cache: "缓存命中率", uniqueTools: "使用过的工具", uniqueSkills: "探索过的 Skill", skillReads: "Skill 使用次数",
    topTools: "最常用的工具", topSkills: "最常用的 Skill", privacy: "隐私保护", privacyText: "公开数据仅包含时间戳、Token 计数、工具名称与 Skill 名称；提示词、回答、参数、文件及工具输出均不会公开。",
    updated: "完整统计截至", days: "天", tokens: "Token", input: "输入", cached: "缓存输入", output: "输出", totalLabel: "总计", less: "少", more: "多", weekOf: "该周始于",
  },
};

const dateKey = (date: Date) => date.toISOString().slice(0, 10);
const startOfWeek = (date: Date) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - ((result.getUTCDay() + 6) % 7));
  return result;
};
const shiftDate = (date: Date, days: number) => { const result = new Date(date); result.setUTCDate(result.getUTCDate() + days); return result; };

function PeriodTooltip({ period, language, weekly }: { period: ActivityPeriod; language: Language; weekly: boolean }) {
  const label = copy[language];
  return <div className={styles.tooltip} role="tooltip">
    <strong>{weekly ? `${label.weekOf} ${formatDate(period.date, language)}` : formatDate(period.date, language)}</strong>
    <span>{label.totalLabel}<b>{compactTokens(period.totalTokens)}</b></span>
    <span>{label.input}<b>{compactTokens(period.inputTokens)}</b></span>
    <span>{label.cached}<b>{compactTokens(period.cachedInputTokens)}</b></span>
    <span>{label.output}<b>{compactTokens(period.outputTokens)}</b></span>
  </div>;
}

function Activity({ daily, language }: { daily: DailyUsage[]; language: Language }) {
  const [view, setView] = useState<ActivityView>("daily");
  const [hovered, setHovered] = useState<ActivityPeriod | null>(null);
  const label = copy[language];
  const lastDate = new Date(`${daily.at(-1)!.date}T00:00:00Z`);
  const byDate = useMemo(() => new Map(daily.map((day) => [day.date, day])), [daily]);

  const dailyPeriods = useMemo(() => {
    const first = view === "lifetime" ? new Date(`${daily[0].date}T00:00:00Z`) : shiftDate(lastDate, -364);
    const start = startOfWeek(first);
    const periods: ActivityPeriod[] = [];
    for (let cursor = new Date(start); cursor <= lastDate; cursor = shiftDate(cursor, 1)) {
      const day = byDate.get(dateKey(cursor));
      periods.push(day ?? { date: dateKey(cursor), totalTokens: 0, inputTokens: 0, cachedInputTokens: 0, outputTokens: 0 });
    }
    return periods;
  }, [byDate, daily, lastDate, view]);

  const weeklyPeriods = useMemo(() => {
    const weeks = new Map<string, ActivityPeriod>();
    for (const day of daily) {
      const week = dateKey(startOfWeek(new Date(`${day.date}T00:00:00Z`)));
      const period = weeks.get(week) ?? { date: week, totalTokens: 0, inputTokens: 0, cachedInputTokens: 0, outputTokens: 0 };
      period.totalTokens += day.totalTokens; period.inputTokens += day.inputTokens; period.cachedInputTokens += day.cachedInputTokens; period.outputTokens += day.outputTokens;
      weeks.set(week, period);
    }
    return [...weeks.values()].slice(-52);
  }, [daily]);

  const periods = view === "weekly" ? weeklyPeriods : dailyPeriods;
  const max = Math.max(1, ...periods.map((period) => period.totalTokens));
  let previousMonth = "";
  const months = view === "weekly" ? [] : dailyPeriods.reduce<{ text: string; column: number }[]>((items, period, index) => {
    const date = new Date(`${period.date}T00:00:00Z`);
    const monthKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    if (monthKey !== previousMonth) {
      previousMonth = monthKey;
      items.push({ text: new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", { month: "short", timeZone: "UTC" }).format(date), column: Math.floor(index / 7) });
    }
    return items;
  }, []);

  return <section className={styles.activityArea}>
    <div className={styles.activityTop}>
      <h2>{label.activity}</h2>
      <div role="tablist" aria-label={label.activity}>{(["daily", "weekly", "lifetime"] as ActivityView[]).map((option) => <button aria-selected={view === option} className={view === option ? styles.selected : ""} key={option} onClick={() => { setView(option); setHovered(null); }} role="tab" type="button">{label[option]}</button>)}</div>
    </div>
    <div className={styles.heatmapWrap}>
      {view === "weekly" ? <div className={styles.weeklyGrid}>{weeklyPeriods.map((period) => {
        const level = period.totalTokens ? Math.max(1, Math.ceil((period.totalTokens / max) * 5)) : 0;
        return <button aria-label={`${label.weekOf} ${period.date}: ${compactTokens(period.totalTokens)} ${label.tokens}`} className={`${styles.weekCell} ${styles[`level${level}`]}`} key={period.date} onBlur={() => setHovered(null)} onFocus={() => setHovered(period)} onMouseEnter={() => setHovered(period)} onMouseLeave={() => setHovered(null)} type="button"><span>{compactTokens(period.totalTokens)}</span><small>{formatDate(period.date, language, false)}</small></button>;
      })}</div> : <>
        <div className={styles.months} style={{ gridTemplateColumns: `repeat(${Math.ceil(dailyPeriods.length / 7)}, minmax(0, 1fr))` }}>{months.map((month) => <span key={`${month.text}-${month.column}`} style={{ gridColumnStart: month.column + 1 }}>{month.text}</span>)}</div>
        <div className={styles.heatmap} style={{ gridTemplateColumns: `repeat(${Math.ceil(dailyPeriods.length / 7)}, minmax(8px, 1fr))` }}>{dailyPeriods.map((period) => {
          const level = period.totalTokens ? Math.max(1, Math.ceil((period.totalTokens / max) * 5)) : 0;
          return <button aria-label={`${period.date}: ${compactTokens(period.totalTokens)} ${label.tokens}`} className={`${styles.cell} ${styles[`level${level}`]}`} key={period.date} onBlur={() => setHovered(null)} onFocus={() => setHovered(period)} onMouseEnter={() => setHovered(period)} onMouseLeave={() => setHovered(null)} type="button" />;
        })}</div>
      </>}
      <div className={styles.heatmapFooter}><span>{view === "weekly" ? `${weeklyPeriods.length} ${label.weekly.toLowerCase()}` : `${formatDate(periods[0].date, language)} — ${formatDate(periods.at(-1)!.date, language)}`}</span><span className={styles.scale}>{label.less}<i className={styles.level0} /><i className={styles.level1} /><i className={styles.level3} /><i className={styles.level5} />{label.more}</span></div>
      {hovered ? <PeriodTooltip language={language} period={hovered} weekly={view === "weekly"} /> : null}
    </div>
  </section>;
}

function RankedList({ entries }: { entries: { name: string; count: number }[] }) {
  return <ol className={styles.rankedList}>{entries.slice(0, 7).map((entry, index) => <li key={entry.name}><i>{index + 1}</i><span>@{entry.name}</span><b>{entry.count.toLocaleString()} 次运行</b></li>)}</ol>;
}

export default function UsageDashboard({ data }: { data: UsageData }) {
  const [language, setLanguage] = useState<Language>("zh");
  const label = copy[language];
  const stats = [[compactTokens(data.totals.totalTokens), label.total], [compactTokens(data.summary.peakTokens), label.peak], [`${data.summary.currentStreak} ${label.days}`, label.current], [`${data.summary.longestStreak} ${label.days}`, label.longest], [compactTokens(data.activity.toolCalls), label.toolCalls]];
  return <main className={styles.shell}>
    <header className={styles.header}><Link href="/">Eric Wang</Link><button onClick={() => setLanguage(language === "zh" ? "en" : "zh")} type="button">{language === "zh" ? "EN" : "中文"}</button></header>
    <section className={styles.profile}><div className={styles.avatar}>EW</div><h1>{label.title}</h1><p>{label.subtitle}</p><small>{label.updated} {formatDate(data.throughDate, language)} · {data.timezone}</small></section>
    <section className={styles.content}>
      <dl className={styles.stats}>{stats.map(([value, name]) => <div key={name}><dd>{value}</dd><dt>{name}</dt></div>)}</dl>
      <Activity daily={data.daily} language={language} />
      <section className={styles.lower}>
        <div><h2>{label.insights}</h2><dl className={styles.insights}><div><dt>{label.sessions}</dt><dd>{data.source.sessionsWithUsage.toLocaleString()}</dd></div><div><dt>{label.active}</dt><dd>{data.summary.activeDays} / {data.summary.calendarDays}</dd></div><div><dt>{label.cache}</dt><dd>{data.totals.cacheHitRate.toFixed(1)}%</dd></div><div><dt>{label.uniqueTools}</dt><dd>{data.activity.uniqueTools}</dd></div><div><dt>{label.uniqueSkills}</dt><dd>{data.activity.uniqueSkills}</dd></div><div><dt>{label.skillReads}</dt><dd>{data.activity.skillReads.toLocaleString()}</dd></div></dl></div>
        <div><h2>{label.topTools}</h2><RankedList entries={data.activity.topTools} /></div>
        <div><h2>{label.topSkills}</h2><RankedList entries={data.activity.topSkills} /></div>
      </section>
      <footer className={styles.privacy}><div><h2>{label.privacy}</h2><p>{label.privacyText}</p></div><a href="/data/codex-usage.json">JSON ↗</a></footer>
    </section>
  </main>;
}
