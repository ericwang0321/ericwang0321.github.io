"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./usage.module.css";
import type { DailyUsage, UsageData } from "./types";

type Language = "en" | "zh";

const compactTokens = (value: number) => {
  const unit = value >= 1_000_000_000 ? "B" : "M";
  const divisor = unit === "B" ? 1_000_000_000 : 1_000_000;
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: value / divisor >= 100 ? 0 : 1 }).format(value / divisor)}${unit}`;
};

const formatDate = (date: string, language: Language) => new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
  year: "numeric", month: "short", day: "numeric", timeZone: "UTC",
}).format(new Date(`${date}T00:00:00Z`));

const copy = {
  en: {
    back: "Portfolio", title: "Eric's Codex activity", subtitle: "A private, local-first activity record.",
    total: "Total tokens", peak: "Peak-day tokens", current: "Current streak", longest: "Longest streak",
    activity: "Token activity", daily: "Daily", weekly: "Weekly", lifetime: "Lifetime",
    insights: "Activity insights", sessions: "Sessions with usage", active: "Active days", cache: "Cache hit rate",
    privacy: "Privacy by design", privacyText: "Only timestamps and token counters are processed. No prompts, responses, files, tool output, skills, or plugins are read or published.",
    updated: "Complete through", days: "days", tokens: "tokens", input: "Input", cached: "Cached input", output: "Output", totalLabel: "Total",
  },
  zh: {
    back: "个人主页", title: "Eric 的 Codex 活动", subtitle: "私密、仅本地处理的活动记录。",
    total: "累计 Token 数", peak: "峰值单日 Token 数", current: "当前连续天数", longest: "最长连续天数",
    activity: "Token 活动", daily: "每日", weekly: "每周", lifetime: "累计",
    insights: "活动洞察", sessions: "有用量的会话", active: "活跃天数", cache: "缓存命中率",
    privacy: "隐私保护", privacyText: "仅处理时间戳与 Token 计数；不会读取或发布提示词、回答、文件、工具输出、技能或插件数据。",
    updated: "完整统计截至", days: "天", tokens: "Token", input: "输入", cached: "缓存输入", output: "输出", totalLabel: "总计",
  },
};

function startOfWeek(date: Date) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() - ((copy.getUTCDay() + 6) % 7));
  return copy;
}

function dateKey(date: Date) { return date.toISOString().slice(0, 10); }

function Heatmap({ daily, language }: { daily: DailyUsage[]; language: Language }) {
  const [hovered, setHovered] = useState<DailyUsage | null>(null);
  const today = new Date(`${daily.at(-1)?.date ?? "2026-01-01"}T00:00:00Z`);
  const end = new Date(today);
  const start = startOfWeek(new Date(Date.UTC(today.getUTCFullYear() - 1, today.getUTCMonth(), today.getUTCDate() + 1)));
  const dates: Date[] = [];
  for (let date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) dates.push(new Date(date));
  const usageByDate = new Map(daily.map((day) => [day.date, day]));
  const max = Math.max(1, ...daily.map((day) => day.totalTokens));
  const label = copy[language];
  const months = useMemo(() => dates.reduce<{ text: string; column: number }[]>((items, date, index) => {
    if (date.getUTCDate() === 1 || (index === 0 && date.getUTCMonth() !== new Date(start).getUTCMonth())) {
      const column = Math.floor(index / 7);
      if (!items.some((item) => item.column === column)) items.push({ text: new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", { month: "short", timeZone: "UTC" }).format(date), column });
    }
    return items;
  }, []), [dates, language, start]);

  return <div className={styles.activityArea}>
    <div className={styles.activityTop}><h2>{label.activity}</h2><div><button className={styles.selected} type="button">{label.daily}</button><span>{label.weekly}</span><span>{label.lifetime}</span></div></div>
    <div className={styles.heatmapWrap}>
      <div className={styles.months}>{months.map((month) => <span key={`${month.text}-${month.column}`} style={{ gridColumnStart: month.column + 1 }}>{month.text}</span>)}</div>
      <div className={styles.heatmap}>
        {dates.map((date) => {
          const day = usageByDate.get(dateKey(date));
          const intensity = day?.totalTokens ? Math.max(1, Math.ceil((day.totalTokens / max) * 5)) : 0;
          return <button aria-label={day ? `${day.date}: ${compactTokens(day.totalTokens)} ${label.tokens}` : dateKey(date)} className={`${styles.cell} ${styles[`level${intensity}`]}`} key={date.toISOString()} onBlur={() => setHovered(null)} onFocus={() => setHovered(day ?? null)} onMouseEnter={() => setHovered(day ?? null)} onMouseLeave={() => setHovered(null)} type="button" />;
        })}
      </div>
      <div className={styles.heatmapFooter}><span>{formatDate(daily[0].date, language)} — {formatDate(daily.at(-1)!.date, language)}</span><span className={styles.scale}>Less <i className={styles.level0} /><i className={styles.level1} /><i className={styles.level3} /><i className={styles.level5} /> More</span></div>
      {hovered ? <div className={styles.tooltip}><strong>{formatDate(hovered.date, language)}</strong><span>{label.totalLabel}<b>{compactTokens(hovered.totalTokens)}</b></span><span>{label.input}<b>{compactTokens(hovered.inputTokens)}</b></span><span>{label.cached}<b>{compactTokens(hovered.cachedInputTokens)}</b></span><span>{label.output}<b>{compactTokens(hovered.outputTokens)}</b></span></div> : null}
    </div>
  </div>;
}

export default function UsageDashboard({ data }: { data: UsageData }) {
  const [language, setLanguage] = useState<Language>("zh");
  const label = copy[language];
  const stats = [
    [compactTokens(data.totals.totalTokens), label.total],
    [compactTokens(data.summary.peakTokens), label.peak],
    [`${data.summary.currentStreak} ${label.days}`, label.current],
    [`${data.summary.longestStreak} ${label.days}`, label.longest],
  ];

  return <main className={styles.shell}>
    <header className={styles.header}><Link href="/">Eric Wang</Link><button onClick={() => setLanguage(language === "zh" ? "en" : "zh")} type="button">{language === "zh" ? "EN" : "中文"}</button></header>
    <section className={styles.profile}>
      <div className={styles.avatar}>EW</div>
      <h1>{label.title}</h1>
      <p>{label.subtitle}</p>
      <small>{label.updated} {formatDate(data.throughDate, language)} · {data.timezone}</small>
    </section>
    <section className={styles.content}>
      <dl className={styles.stats}>{stats.map(([value, name]) => <div key={name}><dd>{value}</dd><dt>{name}</dt></div>)}</dl>
      <Heatmap daily={data.daily} language={language} />
      <section className={styles.lower}>
        <div><h2>{label.insights}</h2><dl className={styles.insights}><div><dt>{label.sessions}</dt><dd>{data.source.sessionsWithUsage.toLocaleString()}</dd></div><div><dt>{label.active}</dt><dd>{data.summary.activeDays} / {data.summary.calendarDays}</dd></div><div><dt>{label.cache}</dt><dd>{data.totals.cacheHitRate.toFixed(1)}%</dd></div></dl></div>
        <div className={styles.privacy}><h2>{label.privacy}</h2><p>{label.privacyText}</p><a href="/data/codex-usage.json">JSON ↗</a></div>
      </section>
    </section>
  </main>;
}
