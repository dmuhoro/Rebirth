/**
 * Rebirth streak calculator (Phase 4).
 *
 * Pure, testable streak logic. A "streak day" is any calendar day on which the
 * user completed a meaningful practice session (reached the practice step).
 * Grace days: a missed day does not break the streak permanently — the streak
 * pauses and resumes on the next completed day (non-shaming copy).
 *
 * All dates are compared as calendar dates (UTC midnight) to avoid timezone
 * drift for the user's local day.
 */

export type StreakResult = {
  currentStreak: number;
  longestStreak: number;
  streakDays: number; // total distinct streak days
  lastActiveDate: string | null; // YYYY-MM-DD
  streakBroken: boolean; // true if yesterday was missed and not yet resumed
};

/** Normalize a Date to a YYYY-MM-DD calendar string (UTC). */
function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Yesterday's calendar date string (UTC). */
function yesterdayString(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return toDateString(d);
}

/** Today's calendar date string (UTC). */
function todayString(): string {
  return toDateString(new Date());
}

/**
 * Compute streak metrics from a sorted array of completed practice session
 * dates (YYYY-MM-DD strings). Duplicates are deduped.
 *
 * Rules:
 * - A streak day counts toward currentStreak only if consecutive from today
 *   going backward (today counts; if today is missed, streak pauses at
 *   yesterday's count).
 * - Grace: missing one day pauses but does not reset; the streak resumes on
 *   the next completed day without resetting to zero. For simplicity and
 *   non-shaming UX, currentStreak counts the trailing consecutive streak
 *   ending at the most recent active day (or today if active today).
 */
export function computeStreak(sessionDates: string[]): StreakResult {
  const unique = [...new Set(sessionDates)].sort();
  const today = todayString();
  const yesterday = yesterdayString();

  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;
  let prevDate: string | null = null;
  let lastActiveDate: string | null = null;

  for (const date of unique) {
    lastActiveDate = date;
    if (prevDate === null) {
      running = 1;
    } else {
      // Consecutive calendar days?
      const prev = new Date(prevDate + "T00:00:00Z");
      const curr = new Date(date + "T00:00:00Z");
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      running = diffDays === 1 ? running + 1 : 1;
    }
    longestStreak = Math.max(longestStreak, running);
    prevDate = date;
  }

  // Current streak: trailing consecutive days ending at lastActiveDate,
  // but only if lastActiveDate is today or yesterday (grace).
  if (unique.length > 0) {
    // Count trailing consecutive run ending at lastActiveDate.
    let trailing = 1;
    let p = unique.length - 2;
    while (p >= 0) {
      const a = new Date(unique[p + 1] + "T00:00:00Z");
      const b = new Date(unique[p] + "T00:00:00Z");
      const diffDays = (a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        trailing += 1;
        p -= 1;
      } else {
        break;
      }
    }
    currentStreak = trailing;
  }

  // Streak is "broken" (paused) if the most recent active day is before
  // yesterday — meaning the user missed yesterday and hasn't resumed today.
  const streakBroken =
    unique.length > 0 && lastActiveDate !== null && lastActiveDate < yesterday;

  return {
    currentStreak,
    longestStreak,
    streakDays: unique.length,
    lastActiveDate,
    streakBroken,
  };
}

/** Whether the user has already completed a practice session today. */
export function isActiveToday(sessionDates: string[]): boolean {
  return sessionDates.includes(todayString());
}
