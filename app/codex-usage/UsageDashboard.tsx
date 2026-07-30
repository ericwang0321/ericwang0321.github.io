"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./usage.module.css";
import type { DailyUsage, UsageData } from "./types";

type Language = "en" | "zh";
type Range = 7 | 14 | 30 | "all";
type TooltipState = {
  day: DailyUsage;
  left: number;
  placement: "above" | "below";
  top: number;
};

const compactTokens = (value: number) => {
  const divisor = value >= 1_000_000_000 ? 1_000_000_000 : 1_000_000;
  const unit = value >= 1_000_000_000 ? "B" : "M";
  const scaled = value / divisor;
  const maximumFractionDigits = unit === "B" ? 2 : scaled >= 100 ? 1 : 2;

  return `${new Intl.NumberFormat("en", { maximumFractionDigits }).format(scaled)}${unit}`;
};

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
    title: "Codex Usage",
    intro: "Daily token usage across local Codex sessions.",
    updated: "Complete through",
    back: "Portfolio",
    total: "Total",
    periodTotal: "Period total",
    average: "Daily average",
    input: "Input",
    inputTotal: "Input total",
    cached: "Cached input",
    uncached: "Uncached input",
    output: "Output",
    outputTotal: "Output total",
    cacheRate: "cache hit",
    activeDays: "active days",
    previous: "vs previous period",
    chart: "Daily usage",
    chartNote: "Hover or focus a bar for values in M/B.",
    days7: "7D",
    days14: "14D",
    days30: "30D",
    all: "All",
    recent: "Recent 14 days",
    date: "Date",
    note: "Only timestamps and token counters are processed. Prompts and responses are not included.",
    data: "Aggregate data",
  },
  zh: {
    title: "Codex 用量",
    intro: "按日汇总本地 Codex 会话的 Token 使用量。",
    updated: "完整统计截至",
    back: "个人主页",
    total: "总计",
    periodTotal: "期间总计",
    average: "日均用量",
    input: "输入",
    inputTotal: "输入总计",
    cached: "缓存输入",
    uncached: "非缓存输入",
    output: "输出",
    outputTotal: "输出总计",
    cacheRate: "缓存命中",
    activeDays: "个活跃日",
    previous: "较上一周期",
    chart: "每日用量",
    chartNote: "悬停或聚焦柱体可查看 M/B 单位数据。",
    days7: "7 天",
    days14: "14 天",
    days30: "30 天",
    all: "全部",
    recent: "最近 14 天",
    date: "日期",
    note: "只处理时间戳和 Token 计数，不包含提示词或回答内容。",
    data: "聚合数据",
  },
};

function UsageTooltip({ day, language }: { day: DailyUsage; language: Language }) {
  const label = copy[language];

  return (
    <>
      <strong>{shortDate(day.date)}</strong>
      <span>{label.cached}<b>{compactTokens(day.cachedInputTokens)}</b></span>
      <span>{label.uncached}<b>{compactTokens(day.uncachedInputTokens)}</b></span>
      <span>{label.output}<b>{compactTokens(day.outputTokens)}</b></span>
      <span>{label.total}<b>{compactTokens(day.totalTokens)}</b></span>
    </>
  );
}

function Bar({ day, max, showDate, onHideTooltip, onShowTooltip }: {
  day: DailyUsage;
  max: number;
  showDate: boolean;
  onHideTooltip: () => void;
  onShowTooltip: (day: DailyUsage, target: HTMLDivElement) => void;
}) {
  const barHeight = day.totalTokens > 0 ? Math.max(2, (day.totalTokens / max) * 100) : 0;

  return (
    <div
      className={styles.barColumn}
      tabIndex={day.totalTokens > 0 ? 0 : -1}
      aria-label={`${day.date}: ${compactTokens(day.totalTokens)} tokens`}
      onBlur={onHideTooltip}
      onFocus={(event) => onShowTooltip(day, event.currentTarget)}
      onMouseEnter={(event) => onShowTooltip(day, event.currentTarget)}
      onMouseLeave={onHideTooltip}
    >
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
  const [range, setRange] = useState<Range>(14);
  const [activeTooltip, setActiveTooltip] = useState<TooltipState | null>(null);
  const label = copy[language];
  const visibleDays = useMemo(
    () => range === "all" ? data.daily : data.daily.slice(-range),
    [data.daily, range],
  );
  const periodStats = useMemo(() => {
    const totals = visibleDays.reduce((sum, day) => ({
      cachedInputTokens: sum.cachedInputTokens + day.cachedInputTokens,
      inputTokens: sum.inputTokens + day.inputTokens,
      outputTokens: sum.outputTokens + day.outputTokens,
      totalTokens: sum.totalTokens + day.totalTokens,
    }), { cachedInputTokens: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0 });
    const days = visibleDays.length;
    const activeDays = visibleDays.filter((day) => day.totalTokens > 0).length;
    const previousDays = range === "all" ? [] : data.daily.slice(-(range * 2), -range);
    const previousTotal = previousDays.reduce((sum, day) => sum + day.totalTokens, 0);

    return {
      ...totals,
      activeDays,
      averageTokens: days > 0 ? totals.totalTokens / days : 0,
      cacheHitRate: totals.inputTokens > 0
        ? (totals.cachedInputTokens / totals.inputTokens) * 100
        : 0,
      days,
      trend: previousTotal > 0
        ? ((totals.totalTokens - previousTotal) / previousTotal) * 100
        : null,
    };
  }, [data.daily, range, visibleDays]);
  const max = Math.max(1, ...visibleDays.map((day) => day.totalTokens));
  const labelInterval = Math.max(1, Math.ceil(visibleDays.length / 7));
  const latestDays = data.daily.slice(-14).reverse();
  const rangeLabel = range === "all" ? label.all : `${range}D`;

  const showTooltip = (day: DailyUsage, target: HTMLDivElement) => {
    const rect = target.getBoundingClientRect();
    const tooltipWidth = Math.min(220, window.innerWidth - 24);
    const centeredLeft = rect.left + rect.width / 2;
    const left = Math.min(
      window.innerWidth - 12 - tooltipWidth / 2,
      Math.max(12 + tooltipWidth / 2, centeredLeft),
    );
    const placement = rect.top < 150 ? "below" : "above";
    const top = placement === "below" ? rect.bottom + 10 : rect.top - 10;

    setActiveTooltip({ day, left, placement, top });
  };

  useEffect(() => {
    if (!activeTooltip) return;
    const hideTooltip = () => setActiveTooltip(null);
    window.addEventListener("resize", hideTooltip);
    window.addEventListener("scroll", hideTooltip, true);
    return () => {
      window.removeEventListener("resize", hideTooltip);
      window.removeEventListener("scroll", hideTooltip, true);
    };
  }, [activeTooltip]);

  return (
    <>
      <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/">Eric Wang&apos;s Page</Link>
          <nav>
            <Link href="/">{label.back}</Link>
            <button type="button" onClick={() => setLanguage((current) => current === "en" ? "zh" : "en")}>
              {language === "en" ? "中文" : "EN"}
            </button>
          </nav>
        </div>
      </header>

      <div className={styles.content}>
        <section className={styles.intro}>
          <h1>{label.title}</h1>
          <p>{label.intro}</p>
          <small>{label.updated} {longDate(data.throughDate, language)} · {data.timezone}</small>
        </section>

        <dl className={styles.summary} aria-label="Usage summary" aria-live="polite">
          <div><dt>{label.periodTotal}</dt><dd>{compactTokens(periodStats.totalTokens)}</dd></div>
          <div><dt>{label.average}</dt><dd>{compactTokens(periodStats.averageTokens)}</dd></div>
          <div><dt>{label.inputTotal}</dt><dd>{compactTokens(periodStats.inputTokens)}</dd></div>
          <div><dt>{label.outputTotal}</dt><dd>{compactTokens(periodStats.outputTokens)}</dd></div>
        </dl>

        <p className={styles.secondarySummary}>
          {rangeLabel} · {periodStats.activeDays}/{periodStats.days} {label.activeDays} · {compactTokens(periodStats.cachedInputTokens)} {label.cached.toLowerCase()} · {periodStats.cacheHitRate.toFixed(1)}% {label.cacheRate}
          {periodStats.trend === null ? "" : ` · ${periodStats.trend > 0 ? "+" : ""}${periodStats.trend.toFixed(1)}% ${label.previous}`}
        </p>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div><h2>{label.chart}</h2><p>{label.chartNote}</p></div>
            <div className={styles.rangePicker} aria-label="Chart range">
              {([7, 14, 30, "all"] as Range[]).map((value) => (
                <button
                  aria-pressed={range === value}
                  className={range === value ? styles.activeRange : ""}
                  key={value}
                  onClick={() => setRange(value)}
                  type="button"
                >
                  {value === 7 ? label.days7 : value === 14 ? label.days14 : value === 30 ? label.days30 : label.all}
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
            <div className={styles.chart} style={{ minWidth: `${Math.max(660, visibleDays.length * 22)}px` }}>
              <div className={styles.axis} aria-hidden="true">
                {[1, 0.5, 0].map((step) => <span key={step}>{compactTokens(max * step)}</span>)}
              </div>
              <div className={styles.plot}>
                <div className={styles.gridLines} aria-hidden="true">{[0, 1, 2].map((line) => <i key={line} />)}</div>
                <div className={styles.bars} style={{ gridTemplateColumns: `repeat(${visibleDays.length}, minmax(10px, 1fr))` }}>
                  {visibleDays.map((day, index) => (
                    <Bar
                      day={day}
                      key={day.date}
                      max={max}
                      onHideTooltip={() => setActiveTooltip(null)}
                      onShowTooltip={showTooltip}
                      showDate={index % labelInterval === 0 || index === visibleDays.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}><div><h2>{label.recent}</h2></div></div>
          <div className={styles.tableScroll}>
            <table>
              <thead><tr><th>{label.date}</th><th>{label.input}</th><th>{label.cached}</th><th>{label.output}</th><th>{label.total}</th></tr></thead>
              <tbody>
                {latestDays.map((day) => (
                  <tr key={day.date}>
                    <td>{longDate(day.date, language)}</td>
                    <td>{compactTokens(day.inputTokens)}</td>
                    <td>{compactTokens(day.cachedInputTokens)}</td>
                    <td>{compactTokens(day.outputTokens)}</td>
                    <td><strong>{compactTokens(day.totalTokens)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className={styles.note}>
          <p>{label.note}</p>
          <a href="/data/codex-usage.json">{label.data} ↗</a>
        </footer>
      </div>
      </main>
      {activeTooltip
        ? createPortal(
            <div
              className={`${styles.tooltip} ${styles.floatingTooltip} ${activeTooltip.placement === "below" ? styles.floatingTooltipBelow : ""}`}
              role="tooltip"
              style={{ left: activeTooltip.left, top: activeTooltip.top }}
            >
              <UsageTooltip day={activeTooltip.day} language={language} />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
