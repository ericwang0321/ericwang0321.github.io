"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./usage.module.css";
import type { DailyUsage, UsageData } from "./types";

type Language = "en" | "zh";
type Range = 14 | 30 | "all";

const compactTokens = (value: number) => new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: value >= 1_000_000_000 ? 2 : 1,
}).format(value);

const exactTokens = (value: number) => new Intl.NumberFormat("en-US").format(value);

const shortDate = (date: string) => new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
}).format(new Date(`${date}T00:00:00Z`));

const longDate = (date: string, language: Language) => new Intl.DateTimeFormat(
  language === "zh" ? "zh-CN" : "en",
  { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" },
).format(new Date(`${date}T00:00:00Z`));

const copy = {
  en: {
    eyebrow: "LOCAL ANALYTICS · CODEX",
    title: "Usage, over time.",
    intro: "Daily token volume across every local Codex session, separated into uncached input, cached input and output.",
    updated: "Complete through",
    back: "← PORTFOLIO",
    lifetime: "Lifetime token volume",
    cacheRate: "Cache hit rate",
    lastSeven: "Last 7 days",
    sessions: "Sessions indexed",
    chartTitle: "Daily token volume",
    chartBody: "Stacked by token type. Hover or focus a bar for exact values.",
    days14: "14D",
    days30: "30D",
    all: "ALL",
    uncached: "Uncached input",
    cached: "Cached input",
    output: "Output",
    total: "Total",
    requests: "Model calls",
    cache: "Cache hit",
    change: "vs previous 7 days",
    peak: "Peak day",
    active: "Active days",
    average: "Average / active day",
    streak: "Current streak",
    latest: "Daily detail",
    latestBody: "Most recent 14 complete days",
    date: "Date",
    sessionsLabel: "Sessions",
    privacy: "Privacy by design",
    privacyBody: "Only timestamps and token counters are processed. Prompts, responses, file contents and tool output are never read into the dataset.",
    json: "AGGREGATE JSON ↗",
    methodology: "Cached input is included within reported input. The chart splits input into cached and uncached portions so stacked totals remain comparable.",
  },
  zh: {
    eyebrow: "本地分析 · CODEX",
    title: "使用量，随时间变化。",
    intro: "汇总所有本地 Codex 会话的每日 token 用量，并拆分为非缓存输入、缓存输入和输出。",
    updated: "完整统计截至",
    back: "← 返回主页",
    lifetime: "累计 Token 用量",
    cacheRate: "缓存命中率",
    lastSeven: "最近 7 天",
    sessions: "已统计会话",
    chartTitle: "每日 Token 用量",
    chartBody: "按 token 类型堆叠；悬停或聚焦柱体可查看精确数据。",
    days14: "14 天",
    days30: "30 天",
    all: "全部",
    uncached: "非缓存输入",
    cached: "缓存输入",
    output: "输出",
    total: "总计",
    requests: "模型调用",
    cache: "缓存命中",
    change: "较此前 7 天",
    peak: "峰值日期",
    active: "活跃天数",
    average: "活跃日均值",
    streak: "当前连续使用",
    latest: "每日明细",
    latestBody: "最近 14 个完整自然日",
    date: "日期",
    sessionsLabel: "会话",
    privacy: "隐私优先",
    privacyBody: "数据集只处理时间戳和 token 计数，不读取提示词、回答、文件内容或工具输出。",
    json: "聚合数据 JSON ↗",
    methodology: "缓存输入已包含在输入总数中。图表将输入拆为缓存与非缓存两部分，保证堆叠总量口径一致。",
  },
};

function Bar({ day, max, label, showDate }: {
  day: DailyUsage;
  max: number;
  label: typeof copy.en;
  showDate: boolean;
}) {
  const barHeight = day.totalTokens > 0 ? Math.max(2, (day.totalTokens / max) * 100) : 0;
  return (
    <div
      className={styles.barColumn}
      tabIndex={day.totalTokens > 0 ? 0 : -1}
      aria-label={`${day.date}: ${exactTokens(day.totalTokens)} tokens`}
    >
      <div className={styles.tooltip}>
        <strong>{shortDate(day.date)}</strong>
        <span>{label.uncached}<b>{exactTokens(day.uncachedInputTokens)}</b></span>
        <span>{label.cached}<b>{exactTokens(day.cachedInputTokens)}</b></span>
        <span>{label.output}<b>{exactTokens(day.outputTokens)}</b></span>
        <span>{label.requests}<b>{exactTokens(day.requests)}</b></span>
      </div>
      <div className={styles.barTrack}>
        {day.totalTokens > 0 ? (
          <div className={styles.barStack} style={{ height: `${barHeight}%` }}>
            <i className={styles.cachedBar} style={{ flexGrow: day.cachedInputTokens }} />
            <i className={styles.inputBar} style={{ flexGrow: day.uncachedInputTokens }} />
            <i className={styles.outputBar} style={{ flexGrow: day.outputTokens }} />
          </div>
        ) : null}
      </div>
      <time className={showDate ? styles.visibleDate : ""}>{showDate ? shortDate(day.date) : ""}</time>
    </div>
  );
}

export default function UsageDashboard({ data }: { data: UsageData }) {
  const [language, setLanguage] = useState<Language>("en");
  const [range, setRange] = useState<Range>(30);
  const label = copy[language];
  const visibleDays = useMemo(
    () => range === "all" ? data.daily : data.daily.slice(-range),
    [data.daily, range],
  );
  const max = Math.max(1, ...visibleDays.map((day) => day.totalTokens));
  const labelInterval = Math.max(1, Math.ceil(visibleDays.length / 8));
  const latestDays = data.daily.slice(-14).reverse();
  const trend = data.summary.sevenDayChangePercent;

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          <strong>EW</strong><span>Eric Wang</span>
        </Link>
        <nav>
          <Link href="/">{label.back}</Link>
          <button type="button" onClick={() => setLanguage((current) => current === "en" ? "zh" : "en")}>
            {language === "en" ? "中文" : "EN"}
          </button>
        </nav>
      </header>

      <section className={styles.hero}>
        <p>{label.eyebrow}</p>
        <h1>{label.title}</h1>
        <div>
          <p>{label.intro}</p>
          <span>{label.updated} {longDate(data.throughDate, language)} · {data.timezone}</span>
        </div>
      </section>

      <section className={styles.metrics} aria-label="Usage summary">
        <article><span>{label.lifetime}</span><strong>{compactTokens(data.totals.totalTokens)}</strong><small>{exactTokens(data.totals.totalTokens)}</small></article>
        <article><span>{label.cacheRate}</span><strong>{data.totals.cacheHitRate}%</strong><small>{compactTokens(data.totals.cachedInputTokens)} cached</small></article>
        <article>
          <span>{label.lastSeven}</span><strong>{compactTokens(data.summary.lastSevenDaysTokens)}</strong>
          <small className={trend !== null && trend >= 0 ? styles.positive : styles.negative}>
            {trend === null ? "—" : `${trend > 0 ? "+" : ""}${trend}%`} {label.change}
          </small>
        </article>
        <article><span>{label.sessions}</span><strong>{exactTokens(data.source.sessionsWithUsage)}</strong><small>{exactTokens(data.totals.requests)} {label.requests.toLowerCase()}</small></article>
      </section>

      <section className={styles.chartPanel}>
        <div className={styles.chartHeader}>
          <div><p>{label.chartTitle}</p><span>{label.chartBody}</span></div>
          <div className={styles.rangePicker} aria-label="Chart range">
            {([14, 30, "all"] as Range[]).map((value) => (
              <button
                className={range === value ? styles.activeRange : ""}
                key={value}
                onClick={() => setRange(value)}
                type="button"
              >
                {value === 14 ? label.days14 : value === 30 ? label.days30 : label.all}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.legend}>
          <span><i className={styles.legendCached} />{label.cached}</span>
          <span><i className={styles.legendInput} />{label.uncached}</span>
          <span><i className={styles.legendOutput} />{label.output}</span>
        </div>

        <div className={styles.chartScroll}>
          <div className={styles.chart} style={{ minWidth: `${Math.max(760, visibleDays.length * 25)}px` }}>
            <div className={styles.axis} aria-hidden="true">
              {[1, 0.75, 0.5, 0.25, 0].map((step) => <span key={step}>{compactTokens(max * step)}</span>)}
            </div>
            <div className={styles.plot}>
              <div className={styles.gridLines} aria-hidden="true">{[0, 1, 2, 3, 4].map((line) => <i key={line} />)}</div>
              <div className={styles.bars} style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(12px, 1fr))` }}>
                {visibleDays.map((day, index) => (
                  <Bar
                    day={day}
                    key={day.date}
                    label={label}
                    max={max}
                    showDate={index % labelInterval === 0 || index === visibleDays.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.insights}>
        <article><span>{label.peak}</span><strong>{shortDate(data.summary.peakDate)}</strong><small>{compactTokens(data.summary.peakTokens)} tokens</small></article>
        <article><span>{label.active}</span><strong>{data.summary.activeDays} / {data.summary.calendarDays}</strong><small>{data.summary.longestStreak}-day longest streak</small></article>
        <article><span>{label.average}</span><strong>{compactTokens(data.summary.averagePerActiveDay)}</strong><small>tokens</small></article>
        <article><span>{label.streak}</span><strong>{data.summary.currentStreak}</strong><small>days</small></article>
      </section>

      <section className={styles.tableSection}>
        <div className={styles.sectionHeading}><div><p>{label.latest}</p><span>{label.latestBody}</span></div></div>
        <div className={styles.tableScroll}>
          <table>
            <thead><tr><th>{label.date}</th><th>{label.uncached}</th><th>{label.cached}</th><th>{label.output}</th><th>{label.total}</th><th>{label.cache}</th><th>{label.sessionsLabel}</th></tr></thead>
            <tbody>
              {latestDays.map((day) => (
                <tr key={day.date}>
                  <td>{longDate(day.date, language)}</td>
                  <td>{compactTokens(day.uncachedInputTokens)}</td>
                  <td>{compactTokens(day.cachedInputTokens)}</td>
                  <td>{compactTokens(day.outputTokens)}</td>
                  <td><strong>{compactTokens(day.totalTokens)}</strong></td>
                  <td>{day.cacheHitRate}%</td>
                  <td>{day.sessions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.privacy}>
        <div><p>{label.privacy}</p><strong>{label.privacyBody}</strong><small>{label.methodology}</small></div>
        <a href="/data/codex-usage.json">{label.json}</a>
      </section>
    </main>
  );
}
