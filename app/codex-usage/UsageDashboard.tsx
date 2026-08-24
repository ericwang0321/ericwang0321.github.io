"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./usage.module.css";
import type { CodexProfileData, OfficialDailyUsage, OfficialInvocation, UsageData } from "./types";

type View = "daily" | "weekly" | "cumulative";
type Tooltip = { left: number; text: string; top: number };

const MAX_COLUMNS = 52;
const ACTIVITY_EPOCH = "2025-07-13";

const shiftDate = (dateIso: string, days: number) => {
  const date = new Date(`${dateIso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const startOfSundayWeek = (dateIso: string) => {
  const date = new Date(`${dateIso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return date.toISOString().slice(0, 10);
};

const columnCount = (todayIso: string) => {
  const todayWeek = new Date(`${startOfSundayWeek(todayIso)}T00:00:00.000Z`).getTime();
  const epoch = new Date(`${ACTIVITY_EPOCH}T00:00:00.000Z`).getTime();
  const elapsedWeeks = Math.floor((todayWeek - epoch) / (7 * 24 * 60 * 60 * 1000));
  return Math.min(MAX_COLUMNS, Math.max(1, elapsedWeeks + 1));
};

const chartStart = (todayIso: string, columns: number) =>
  shiftDate(startOfSundayWeek(todayIso), -(columns - 1) * 7);

const dailyValues = (
  usage: UsageData,
  officialDailyUsage: OfficialDailyUsage[] | undefined,
  officialOverrides: OfficialDailyUsage[] | undefined,
  todayIso: string,
  columns: number,
) => {
  const start = chartStart(todayIso, columns);
  const byDate = officialDailyUsage
    ? new Map(officialDailyUsage.map((day) => [day.date, Math.max(0, day.credits)]))
    : new Map(usage.daily.map((day) => [day.date, Math.max(0, day.totalTokens)]));
  for (const day of officialOverrides ?? []) byDate.set(day.date, Math.max(0, day.credits));
  return Array.from({ length: columns * 7 }, (_, index) => byDate.get(shiftDate(start, index)) ?? 0);
};

const dailyLevels = (values: number[]) => {
  const max = values.reduce((peak, value) => Math.max(peak, value), 0);
  return values.map((value) => {
    if (value <= 0 || max <= 0) return 0;
    const ratio = value / max;
    if (ratio > 0.75) return 4;
    if (ratio > 0.5) return 3;
    if (ratio > 0.25) return 2;
    return 1;
  });
};

const weeklyTotals = (values: number[]) =>
  Array.from({ length: Math.ceil(values.length / 7) }, (_, column) =>
    values.slice(column * 7, column * 7 + 7).reduce((sum, value) => sum + value, 0),
  );

const cumulativeTotals = (values: number[]) =>
  values.reduce<number[]>((result, value) => {
    result.push((result.at(-1) ?? 0) + value);
    return result;
  }, []);

const aggregateLevels = (totals: number[]) => {
  const max = totals.reduce((peak, value) => Math.max(peak, value), 0);
  return Array.from({ length: totals.length * 7 }, (_, index) => {
    const row = index % 7;
    const total = totals[Math.floor(index / 7)] ?? 0;
    const filledRows = total <= 0 || max <= 0 ? 0 : Math.max(1, Math.ceil((total / max) * 7));
    return filledRows === 0 || 7 - row > filledRows ? 0 : 4;
  });
};

const cellsForView = (values: number[], view: View) => {
  if (view === "daily") return dailyLevels(values);
  const weeks = weeklyTotals(values);
  return aggregateLevels(view === "weekly" ? weeks : cumulativeTotals(weeks));
};

const monthLabels = (todayIso: string, columns: number) => {
  const start = new Date(`${chartStart(todayIso, columns)}T00:00:00.000Z`);
  const today = new Date(`${todayIso}T00:00:00.000Z`);
  const difference = (today.getUTCFullYear() - start.getUTCFullYear()) * 12
    + today.getUTCMonth() - start.getUTCMonth();
  const count = Math.min(12, difference + 1);
  return Array.from({ length: count }, (_, index) => {
    const monthOffset = index - (count - 1);
    return `${new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + monthOffset, 1)).getUTCMonth() + 1}月`;
  });
};

const formatTokenCount = (value: number) => new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 1,
  notation: "compact",
}).format(Math.max(0, Math.round(value)));

const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

const formatDuration = (milliseconds: number) => {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  if (seconds >= 3600) {
    const totalMinutes = Math.round(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes === 0 ? `${hours} 小时` : `${hours} 小时 ${minutes} 分`;
  }
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds === 0 ? `${minutes} 分` : `${minutes} 分 ${remainingSeconds} 秒`;
  }
  return `${seconds} 秒`;
};

const formatTooltipDate = (dateIso: string) => {
  const date = new Date(`${dateIso}T00:00:00.000Z`);
  return `${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
};

const iconByName: Record<string, string> = {
  spreadsheets: "/plugin-icons/spreadsheets.png",
  presentations: "/plugin-icons/presentations.png",
  documents: "/plugin-icons/documents.png",
  sites: "/plugin-icons/sites.svg",
};

function InvocationIcon({ invocation, name }: { invocation: OfficialInvocation; name: string }) {
  if (invocation.type === "skill") {
    return <span aria-hidden="true" className={styles.skillCube}><i /><b /><em /></span>;
  }

  const icon = iconByName[name];
  return <span aria-hidden="true" className={styles.invocationIcon}>
    {icon ? <Image alt="" height={18} src={icon} width={18} /> : <span>{name.slice(0, 1).toUpperCase()}</span>}
  </span>;
}

function TokenActivity({ dailyUsage, dailyUsageOverrides, todayIso, usage }: {
  dailyUsage?: OfficialDailyUsage[];
  dailyUsageOverrides?: OfficialDailyUsage[];
  todayIso: string;
  usage: UsageData;
}) {
  const [view, setView] = useState<View>("daily");
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const columns = columnCount(todayIso);
  const values = useMemo(
    () => dailyValues(usage, dailyUsage, dailyUsageOverrides, todayIso, columns),
    [columns, dailyUsage, dailyUsageOverrides, todayIso, usage],
  );
  const cells = useMemo(() => cellsForView(values, view), [values, view]);
  const weeks = useMemo(() => weeklyTotals(values), [values]);
  const cumulative = useMemo(() => cumulativeTotals(weeks), [weeks]);
  const months = monthLabels(todayIso, columns);
  const start = chartStart(todayIso, columns);

  const showTooltip = (element: HTMLElement, index: number) => {
    const chart = element.closest(`.${styles.chartScroll}`) as HTMLElement | null;
    if (!chart) return;

    const cellRect = element.getBoundingClientRect();
    const chartRect = chart.getBoundingClientRect();
    const viewportCenter = Math.max(110, Math.min(window.innerWidth - 110, cellRect.left + cellRect.width / 2));
    const weekIndex = Math.floor(index / 7);
    const date = view === "daily" ? shiftDate(start, index) : shiftDate(start, weekIndex * 7);
    const tokenCount = view === "daily"
      ? values[index] ?? 0
      : view === "weekly" ? weeks[weekIndex] ?? 0 : cumulative[weekIndex] ?? 0;
    const text = view === "daily"
      ? `${formatTooltipDate(date)} 使用了 ${formatTokenCount(tokenCount)} 个 Token`
      : view === "weekly"
        ? `${formatTooltipDate(date)} 当周使用了 ${formatTokenCount(tokenCount)} 个 Token`
        : `截至 ${formatTooltipDate(date)} 累计使用了 ${formatTokenCount(tokenCount)} 个 Token`;

    setTooltip({
      left: viewportCenter - chartRect.left,
      text,
      top: cellRect.top - chartRect.top,
    });
  };

  return <section className={styles.activitySection}>
    <div className={styles.activityHeader}>
      <h2>Token 活动</h2>
      <div aria-label="Token 活动视图" className={styles.tabs} role="group">
        {(["daily", "weekly", "cumulative"] as View[]).map((option) => <button
          aria-pressed={view === option}
          className={view === option ? styles.activeTab : ""}
          key={option}
          onClick={() => { setView(option); setTooltip(null); }}
          type="button"
        >{option === "daily" ? "每日" : option === "weekly" ? "每周" : "累计"}</button>)}
      </div>
    </div>

    <div className={styles.chartScroll}>
      <div
        aria-label="Codex Token 活动热力图"
        className={styles.heatmap}
        role="img"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(1px, 1fr))` }}
      >{cells.map((level, index) => {
        const date = shiftDate(start, index);
        if (view === "daily" && date > todayIso) return null;
        return <span
          aria-label={view === "daily" ? `${formatTooltipDate(date)}，${formatTokenCount(values[index] ?? 0)} Token` : undefined}
          className={`${styles.cell} ${styles[`level${level}`]}`}
          key={`${view}-${index}`}
          onClick={(event) => showTooltip(event.currentTarget, index)}
          onMouseEnter={(event) => showTooltip(event.currentTarget, index)}
          onMouseLeave={() => setTooltip(null)}
        />;
      })}</div>
      <div className={styles.months}>{months.map((month, index) => <span key={`${month}-${index}`}>{month}</span>)}</div>
      {tooltip ? <div className={styles.tooltip} role="tooltip" style={{ left: tooltip.left, top: tooltip.top }}>{tooltip.text}</div> : null}
    </div>
  </section>;
}

export default function UsageDashboard({ profile, usage }: { profile: CodexProfileData; usage: UsageData }) {
  const stats = [
    { value: formatTokenCount(profile.summary.totalTextTokens), label: "累计 Token 数" },
    { value: formatTokenCount(profile.summary.peakTokens), label: "峰值 Token 数" },
    { value: formatDuration(profile.summary.longestTaskDurationMs), label: "最长聊天时长" },
    { value: `${profile.summary.currentStreakDays} 天`, label: "当前连续天数" },
    { value: `${profile.summary.longestStreakDays} 天`, label: "最长连续天数" },
  ];

  const insightRows = [
    { label: "快速模式", value: `${Math.round(profile.activityInsights.fastModePercent)}%` },
    { label: "最常用的推理强度", value: <><strong>{profile.activityInsights.reasoningEffort}</strong> · {Math.round(profile.activityInsights.reasoningEffortPercent)}%</> },
    { label: "已探索的技能", value: formatNumber(profile.activityInsights.skillsExplored) },
    { label: "使用的技能总数", value: formatNumber(profile.activityInsights.totalSkillsUsed) },
    { label: "聊天总数", value: formatNumber(profile.activityInsights.totalThreads) },
  ];

  return <main className={styles.page}>
    <Link aria-label="返回网站主页" className={styles.backHome} href="/">
      <span aria-hidden="true" className={styles.backArrow}>←</span>
      <span>返回主页</span>
    </Link>
    <div className={styles.dashboard}>
      <section className={styles.profileSection}>
        <div className={styles.avatarWrap}>
          <Image alt={profile.profile.displayName} className={styles.avatar} fill priority sizes="80px" src={profile.profile.imageUrl} />
          <span aria-label="布丁，我的 Codex 宠物" className={styles.pet} role="img" />
        </div>
        <h1>{profile.profile.displayName}</h1>
        <div className={styles.identityMeta}>
          <span>@{profile.profile.username}</span>
          <span aria-hidden="true" className={styles.dot}>·</span>
          <span className={styles.plan}>{profile.profile.plan}</span>
        </div>
      </section>

      <dl className={styles.summary}>{stats.map((stat, index) => <div className={styles.statGroup} key={stat.label}>
        {index > 0 ? <span aria-hidden="true" className={styles.statDivider} /> : null}
        <div className={styles.stat}>
          <dd>{stat.value}</dd>
          <dt>{stat.label}</dt>
        </div>
      </div>)}</dl>

      <TokenActivity
        dailyUsage={profile.dailyUsage}
        dailyUsageOverrides={profile.dailyUsageOverrides}
        todayIso={profile.todayIso}
        usage={usage}
      />

      <section aria-label="Codex 活动" className={styles.details}>
        <div className={styles.insights}>
          <h2>活动洞察</h2>
          <dl>{insightRows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
        </div>

        <div className={styles.invocations}>
          <h2>最常用的插件</h2>
          <ul>{profile.activityInsights.invocations.map((invocation) => {
            const fullName = invocation.type === "plugin" ? invocation.pluginName : invocation.skillName;
            const name = fullName?.split(":").at(-1) ?? "";
            return <li key={`${invocation.type}-${name}`}>
              <div>
                <InvocationIcon invocation={invocation} name={name} />
                <span>{invocation.type === "plugin" ? "@" : "$"}{name}</span>
              </div>
              <span>{formatNumber(invocation.usageCount)} 次运行</span>
            </li>;
          })}</ul>
        </div>
      </section>
    </div>
  </main>;
}
