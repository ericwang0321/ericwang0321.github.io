"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import styles from "./usage.module.css";
import type { DailyUsage, UsageData } from "./types";

type View = "daily" | "weekly" | "lifetime";
type Period = { date: string; totalTokens: number };

const formatTokens = (value: number) => {
  if (value === 0) return "0M";
  if (value < 10_000) return "<0.01M";
  const divisor = value >= 1_000_000_000 ? 1_000_000_000 : 1_000_000;
  const unit = value >= 1_000_000_000 ? "B" : "M";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value / divisor)}${unit}`;
};
const dateKey = (date: Date) => date.toISOString().slice(0, 10);
const shiftDate = (date: Date, days: number) => { const result = new Date(date); result.setUTCDate(result.getUTCDate() + days); return result; };
const startOfWeek = (date: Date) => { const result = new Date(date); result.setUTCDate(result.getUTCDate() - ((result.getUTCDay() + 6) % 7)); return result; };
const monthLabel = (date: Date) => `${date.getUTCMonth() + 1}月`;
const compactCount = (value: number) => value.toLocaleString("zh-CN");
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return `${hours} 小时 ${minutes} 分`;
};

const makeDayPeriods = (requestedStart: Date, lastDate: Date, byDate: Map<string, number>) => {
  const start = startOfWeek(requestedStart);
  const periods: Period[] = [];
  for (let cursor = new Date(start); cursor <= lastDate; cursor = shiftDate(cursor, 1)) {
    const date = dateKey(cursor);
    periods.push({ date, totalTokens: byDate.get(date) ?? 0 });
  }
  return periods;
};

const pluginMeta: Record<string, { icon: string; tone: string }> = {
  spreadsheets: { icon: "▦", tone: "green" },
  presentations: { icon: "▣", tone: "orange" },
  "company-model-harness": { icon: "◆", tone: "violet" },
  documents: { icon: "▤", tone: "blue" },
  sites: { icon: "✣", tone: "cyan" },
};

function TokenTooltip({ period }: { period: Period }) {
  return <div aria-live="polite" className={styles.tooltip} role="tooltip"><strong>{period.date}</strong><span>{formatTokens(period.totalTokens)} tokens</span></div>;
}

function DayMap({ periods, setHovered }: { periods: Period[]; setHovered: (period: Period | null) => void }) {
  const max = Math.max(1, ...periods.map((period) => period.totalTokens));
  const columns = Math.ceil(periods.length / 7);
  const [focusIndex, setFocusIndex] = useState(Math.max(0, periods.length - 1));
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const months = periods.flatMap((period, index) => {
    const date = new Date(`${period.date}T00:00:00Z`);
    const previousDate = index > 0 ? new Date(`${periods[index - 1].date}T00:00:00Z`) : null;
    const isNewMonth = !previousDate
      || date.getUTCFullYear() !== previousDate.getUTCFullYear()
      || date.getUTCMonth() !== previousDate.getUTCMonth();
    if (!isNewMonth || (index === 0 && date.getUTCDate() > 7)) return [];
    return [{ label: monthLabel(date), column: Math.floor(index / 7) + 1 }];
  });

  const moveFocus = (index: number, key: string) => {
    const offsets: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };
    const requestedIndex = key === "Home" ? 0 : key === "End" ? periods.length - 1 : index + (offsets[key] ?? 0);
    const nextIndex = Math.max(0, Math.min(periods.length - 1, requestedIndex));
    setFocusIndex(nextIndex);
    cellRefs.current[nextIndex]?.focus();
  };

  return <>
    <div aria-label="Daily token activity" className={styles.heatmap} role="group" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{periods.map((period, index) => {
      const level = period.totalTokens ? Math.max(1, Math.ceil((period.totalTokens / max) * 5)) : 0;
      return <button
        aria-current={index === focusIndex ? "date" : undefined}
        aria-label={`${period.date}, ${formatTokens(period.totalTokens)} tokens`}
        className={`${styles.cell} ${styles[`level${level}`]}`}
        key={period.date}
        onBlur={() => setHovered(null)}
        onClick={() => setHovered(period)}
        onFocus={() => { setFocusIndex(index); setHovered(period); }}
        onKeyDown={(event) => {
          if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          moveFocus(index, event.key);
        }}
        onMouseEnter={() => setHovered(period)}
        onMouseLeave={(event) => {
          if (event.currentTarget !== document.activeElement) setHovered(null);
        }}
        ref={(element) => { cellRefs.current[index] = element; }}
        tabIndex={index === focusIndex ? 0 : -1}
        type="button"
      />;
    })}</div>
    <div className={styles.months} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{months.map((month) => <span key={`${month.label}-${month.column}`} style={{ gridColumnStart: month.column }}>{month.label}</span>)}</div>
  </>;
}

function WeekMap({ periods, setHovered }: { periods: Period[]; setHovered: (period: Period | null) => void }) {
  const max = Math.max(1, ...periods.map((period) => period.totalTokens));
  const [focusIndex, setFocusIndex] = useState(Math.max(0, periods.length - 1));
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const moveFocus = (index: number, key: string) => {
    const offsets: Record<string, number> = { ArrowUp: -13, ArrowDown: 13, ArrowLeft: -1, ArrowRight: 1 };
    const requestedIndex = key === "Home" ? 0 : key === "End" ? periods.length - 1 : index + (offsets[key] ?? 0);
    const nextIndex = Math.max(0, Math.min(periods.length - 1, requestedIndex));
    setFocusIndex(nextIndex);
    cellRefs.current[nextIndex]?.focus();
  };

  return <div aria-label="Weekly token activity" className={styles.weekMap} role="group">{periods.map((period, index) => {
    const level = period.totalTokens ? Math.max(1, Math.ceil((period.totalTokens / max) * 5)) : 0;
    return <button
      aria-current={index === focusIndex ? "date" : undefined}
      aria-label={`${period.date} 当周, ${formatTokens(period.totalTokens)} tokens`}
      className={`${styles.weekCell} ${styles[`level${level}`]}`}
      key={period.date}
      onBlur={() => setHovered(null)}
      onClick={() => setHovered(period)}
      onFocus={() => { setFocusIndex(index); setHovered(period); }}
      onKeyDown={(event) => {
        if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        moveFocus(index, event.key);
      }}
      onMouseEnter={() => setHovered(period)}
      onMouseLeave={(event) => {
        if (event.currentTarget !== document.activeElement) setHovered(null);
      }}
      ref={(element) => { cellRefs.current[index] = element; }}
      tabIndex={index === focusIndex ? 0 : -1}
      type="button"
    />;
  })}</div>;
}

function ActivityHeatmap({ data }: { data: DailyUsage[] }) {
  const [hovered, setHovered] = useState<Period | null>(null);
  const lastDateKey = data.at(-1)!.date;
  const byDate = useMemo(() => new Map(data.map((day) => [day.date, day.totalTokens])), [data]);

  const dailyPeriods = useMemo(() => {
    const lastDate = new Date(`${lastDateKey}T00:00:00Z`);
    return makeDayPeriods(shiftDate(lastDate, -364), lastDate, byDate);
  }, [byDate, lastDateKey]);
  const lifetimePeriods = useMemo(() => {
    const lastDate = new Date(`${lastDateKey}T00:00:00Z`);
    return makeDayPeriods(new Date(`${data[0].date}T00:00:00Z`), lastDate, byDate);
  }, [byDate, data, lastDateKey]);

  const weeks = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const day of data) {
      const week = dateKey(startOfWeek(new Date(`${day.date}T00:00:00Z`)));
      grouped.set(week, (grouped.get(week) ?? 0) + day.totalTokens);
    }
    return [...grouped].slice(-52).map(([date, totalTokens]) => ({ date, totalTokens }));
  }, [data]);

  return <section className={styles.activitySection}>
    <div className={styles.activityHeader}>
      <h2>Token 活动</h2>
      <div aria-label="Token 活动视图" className={styles.tabs} role="radiogroup">
        {(["daily", "weekly", "lifetime"] as View[]).map((option) => <span key={option}>
          <input className={styles[`${option}Toggle`]} defaultChecked={option === "daily"} id={`token-view-${option}`} name="token-view" onChange={() => setHovered(null)} type="radio" />
          <label htmlFor={`token-view-${option}`}>{option === "daily" ? "每日" : option === "weekly" ? "每周" : "累计"}</label>
        </span>)}
      </div>
    </div>
    <div className={styles.mapWrap}>
      <div className={`${styles.viewPanel} ${styles.dailyPanel}`}><DayMap periods={dailyPeriods} setHovered={setHovered} /></div>
      <div className={`${styles.viewPanel} ${styles.weeklyPanel}`}>
        <WeekMap periods={weeks} setHovered={setHovered} />
        <div className={styles.weekCaption}>最近 {weeks.length} 周</div>
      </div>
      <div className={`${styles.viewPanel} ${styles.lifetimePanel}`}><DayMap periods={lifetimePeriods} setHovered={setHovered} /></div>
      {hovered ? <TokenTooltip period={hovered} /> : null}
    </div>
  </section>;
}

export default function UsageDashboard({ data }: { data: UsageData }) {
  const stats = [
    { value: formatTokens(data.totals.totalTokens), label: "累计 Token 数" },
    { value: formatTokens(data.summary.peakChatTokens), label: "峰值 Token 数" },
    { value: formatDuration(data.summary.longestChatSeconds), label: "最长聊天时长" },
    { value: `${data.summary.currentStreak} 天`, label: "当前连续天数" },
    { value: `${data.summary.longestStreak} 天`, label: "最长连续天数" },
  ];

  return <main className={styles.page}>
    <header className={styles.siteHeader}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/">Eric Wang</Link>
        <nav aria-label="Codex Usage navigation">
          <Link href="/#research">Research</Link>
          <span aria-current="page">Codex Usage</span>
        </nav>
        <Link className={styles.homeLink} href="/">返回首页 <span aria-hidden="true">↗</span></Link>
      </div>
    </header>
    <div className={styles.dashboard}>
      <section className={styles.intro}>
        <div className={styles.introCopy}>
          <p>ACTIVITY</p>
          <h1>Codex Usage</h1>
          <span>按日记录的 token 使用、活动节奏与工具偏好。</span>
        </div>
        <div className={styles.profile}>
        <div className={styles.avatarWrap}>
          <Image alt="Eric Wang" className={styles.avatar} fill priority sizes="82px" src="/eric.png" />
          <span aria-label="布丁，我的 Codex 宠物" className={styles.pet} role="img" />
        </div>
          <div>
            <strong>Eric Wang</strong>
            <span className={styles.handle}>@ericwang0321</span>
          </div>
        </div>
      </section>

      <dl className={styles.summary}>{stats.map((stat) => <div key={stat.label}><dd>{stat.value}</dd><dt>{stat.label}</dt></div>)}</dl>

      <ActivityHeatmap data={data.daily} />

      <section className={styles.details}>
        <div className={styles.insights}>
          <h2>活动洞察</h2>
          <dl>
            <div><dt>快速模式</dt><dd>{Math.round(data.behavior.fastModePercent)}%</dd></div>
            <div><dt>最常用的推理强度</dt><dd><strong>{data.behavior.reasoningLabel}</strong> · {Math.round(data.behavior.reasoningPercent)}%</dd></div>
            <div><dt>已探索的技能</dt><dd>{data.activity.uniqueSkills}</dd></div>
            <div><dt>使用的技能总数</dt><dd>{compactCount(data.activity.skillReads)}</dd></div>
            <div><dt>聊天总数</dt><dd>{compactCount(data.source.sessionsWithUsage)}</dd></div>
          </dl>
        </div>

        <div className={styles.plugins}>
          <h2>最常用的插件</h2>
          <ol>{data.activity.topPlugins.map((plugin) => {
            const meta = pluginMeta[plugin.name] ?? { icon: "◆", tone: "blue" };
            return <li key={plugin.name}><i className={styles[meta.tone]}>{meta.icon}</i><span>@{plugin.name}</span><b>{compactCount(plugin.count)} 次运行</b></li>;
          })}</ol>
        </div>
      </section>

      <footer>统计截至 {data.throughDate} · 仅公开时间、计数与调用名称，不包含对话内容</footer>
    </div>
  </main>;
}
