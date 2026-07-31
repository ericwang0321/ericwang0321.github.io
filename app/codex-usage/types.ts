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
