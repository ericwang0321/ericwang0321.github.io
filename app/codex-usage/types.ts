export type DailyUsage = {
  date: string;
  inputTokens: number;
  cachedInputTokens: number;
  uncachedInputTokens: number;
  cacheWriteInputTokens: number;
  outputTokens: number;
  reasoningOutputTokens: number;
  totalTokens: number;
  requests: number;
  sessions: number;
  cacheHitRate: number;
};

export type OfficialDailyUsage = {
  date: string;
  credits: number;
};

export type OfficialInvocation = {
  type: "plugin" | "skill";
  pluginName?: string;
  skillName?: string;
  usageCount: number;
};

export type CodexProfileData = {
  schemaVersion: number;
  syncedAt: string;
  todayIso: string;
  source: {
    kind: "official-profile-snapshot";
    endpoint: "/wham/profiles/me";
    note: string;
  };
  profile: {
    displayName: string;
    username: string;
    plan: string;
    imageUrl: string;
  };
  summary: {
    totalTextTokens: number;
    peakTokens: number;
    longestTaskDurationMs: number;
    currentStreakDays: number;
    longestStreakDays: number;
  };
  activityInsights: {
    fastModePercent: number;
    reasoningEffort: string;
    reasoningEffortPercent: number;
    skillsExplored: number;
    totalSkillsUsed: number;
    totalThreads: number;
    invocations: OfficialInvocation[];
  };
  dailyUsage?: OfficialDailyUsage[];
};

export type UsageData = {
  schemaVersion: number;
  generatedAt: string;
  timezone: string;
  throughDate: string;
  source: {
    firstDate: string;
    filesIndexed: number;
    sessionsWithUsage: number;
    invalidTokenLines: number;
    inheritedEventsSkipped: number;
    inheritedTokenEventsSkipped: number;
    contentRead: boolean;
  };
  totals: Omit<DailyUsage, "date">;
  summary: {
    calendarDays: number;
    activeDays: number;
    averagePerActiveDay: number;
    lastSevenDaysTokens: number;
    previousSevenDaysTokens: number;
    sevenDayChangePercent: number | null;
    peakDate: string;
    peakTokens: number;
    peakChatTokens: number;
    longestChatSeconds: number;
    currentStreak: number;
    longestStreak: number;
  };
  behavior: {
    fastModePercent: number;
    reasoningLabel: string;
    reasoningPercent: number;
  };
  activity: {
    toolCalls: number;
    uniqueTools: number;
    skillReads: number;
    uniqueSkills: number;
    topTools: { name: string; count: number }[];
    topSkills: { name: string; count: number }[];
    topPlugins: { name: string; count: number }[];
  };
  daily: DailyUsage[];
};
