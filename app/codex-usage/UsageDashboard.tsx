"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "./usage.module.css";
import type { DailyUsage, UsageData } from "./types";

type View = "daily" | "weekly" | "lifetime";
type Period = { date: string; totalTokens: number };

const formatChineseTokens = (value: number) => `${new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 }).format(value / 100_000_000)}亿`;
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

const pluginMeta: Record<string, { icon: string; tone: string }> = {
  spreadsheets: { icon: "▦", tone: "green" },
  presentations: { icon: "▣", tone: "orange" },
  "company-model-harness": { icon: "◆", tone: "violet" },
  documents: { icon: "▤", tone: "blue" },
  sites: { icon: "✣", tone: "cyan" },
};

function TokenTooltip({ period }: { period: Period }) {
  return <div className={styles.tooltip} role="tooltip"><strong>{period.date}</strong><span>{formatChineseTokens(period.totalTokens)} Token</span></div>;
}

function ActivityHeatmap({ data }: { data: DailyUsage[] }) {
  const [view, setView] = useState<View>("daily");
  const [hovered, setHovered] = useState<Period | null>(null);
  const lastDate = new Date(`${data.at(-1)!.date}T00:00:00Z`);
  const byDate = useMemo(() => new Map(data.map((day) => [day.date, day.totalTokens])), [data]);

  const dayPeriods = useMemo(() => {
    const requestedStart = view === "lifetime" ? new Date(`${data[0].date}T00:00:00Z`) : shiftDate(lastDate, -364);
    const start = startOfWeek(requestedStart);
    const periods: Period[] = [];
    for (let cursor = new Date(start); cursor <= lastDate; cursor = shiftDate(cursor, 1)) {
      const date = dateKey(cursor);
      periods.push({ date, totalTokens: byDate.get(date) ?? 0 });
    }
    return periods;
  }, [byDate, data, lastDate, view]);

  const weeks = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const day of data) {
      const week = dateKey(startOfWeek(new Date(`${day.date}T00:00:00Z`)));
      grouped.set(week, (grouped.get(week) ?? 0) + day.totalTokens);
    }
    return [...grouped].slice(-52).map(([date, totalTokens]) => ({ date, totalTokens }));
  }, [data]);

  const periods = view === "weekly" ? weeks : dayPeriods;
  const max = Math.max(1, ...periods.map((period) => period.totalTokens));
  const columns = Math.ceil(dayPeriods.length / 7);
  let previousMonth = "";
  const months = dayPeriods.reduce<{ label: string; column: number }[]>((result, period, index) => {
    const date = new Date(`${period.date}T00:00:00Z`);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    if (key !== previousMonth) {
      previousMonth = key;
      if (!(index === 0 && date.getUTCDate() > 7)) result.push({ label: monthLabel(date), column: Math.floor(index / 7) + 1 });
    }
    return result;
  }, []);

  return <section className={styles.activitySection}>
    <div className={styles.activityHeader}>
      <h2>Token 活动</h2>
      <div className={styles.tabs} role="tablist" aria-label="Token 活动视图">
        {(["daily", "weekly", "lifetime"] as View[]).map((option) => <button aria-selected={view === option} className={view === option ? styles.activeTab : ""} key={option} onClick={() => { setView(option); setHovered(null); }} role="tab" type="button">{option === "daily" ? "每日" : option === "weekly" ? "每周" : "累计"}</button>)}
      </div>
    </div>
    <div className={styles.mapWrap}>
      {view === "weekly" ? <div className={styles.weekMap}>{weeks.map((period) => {
        const level = period.totalTokens ? Math.max(1, Math.ceil((period.totalTokens / max) * 5)) : 0;
        return <button aria-label={`${period.date} 当周 ${formatChineseTokens(period.totalTokens)} Token`} className={`${styles.weekCell} ${styles[`level${level}`]}`} key={period.date} onBlur={() => setHovered(null)} onFocus={() => setHovered(period)} onMouseEnter={() => setHovered(period)} onMouseLeave={() => setHovered(null)} type="button" />;
      })}</div> : <>
        <div className={styles.heatmap} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{dayPeriods.map((period) => {
          const level = period.totalTokens ? Math.max(1, Math.ceil((period.totalTokens / max) * 5)) : 0;
          return <button aria-label={`${period.date} ${formatChineseTokens(period.totalTokens)} Token`} className={`${styles.cell} ${styles[`level${level}`]}`} key={period.date} onBlur={() => setHovered(null)} onFocus={() => setHovered(period)} onMouseEnter={() => setHovered(period)} onMouseLeave={() => setHovered(null)} type="button" />;
        })}</div>
        <div className={styles.months} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{months.map((month) => <span key={`${month.label}-${month.column}`} style={{ gridColumnStart: month.column }}>{month.label}</span>)}</div>
      </>}
      {view === "weekly" ? <div className={styles.weekCaption}>最近 {weeks.length} 周</div> : null}
      {hovered ? <TokenTooltip period={hovered} /> : null}
    </div>
  </section>;
}

export default function UsageDashboard({ data }: { data: UsageData }) {
  const stats = [
    { value: formatChineseTokens(data.totals.totalTokens), label: "累计 Token 数" },
    { value: formatChineseTokens(data.summary.peakChatTokens), label: "峰值 Token 数" },
    { value: formatDuration(data.summary.longestChatSeconds), label: "最长聊天时长" },
    { value: `${data.summary.currentStreak} 天`, label: "当前连续天数" },
    { value: `${data.summary.longestStreak} 天`, label: "最长连续天数" },
  ];

  return <main className={styles.page}>
    <div className={styles.dashboard}>
      <section className={styles.profile}>
        <div className={styles.avatarWrap}><Image alt="Eric Wang" className={styles.avatar} fill priority sizes="82px" src="/eric.png" /><span aria-hidden="true" className={styles.pet}>🐈</span></div>
        <h1>Eric</h1>
        <div className={styles.handle}>@ericwang0321 <span>Pro</span></div>
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
