import { describe, it, expect } from "vitest";
import { computeStreak, isActiveToday } from "../lib/streak";

describe("Streak calculator (Phase 4)", () => {
  it("returns zeros for no sessions", () => {
    const r = computeStreak([]);
    expect(r.currentStreak).toBe(0);
    expect(r.longestStreak).toBe(0);
    expect(r.streakDays).toBe(0);
    expect(r.lastActiveDate).toBeNull();
    expect(r.streakBroken).toBe(false);
  });

  it("counts a single session today as streak of 1 and active today", () => {
    const today = new Date().toISOString().slice(0, 10);
    const r = computeStreak([today]);
    expect(r.currentStreak).toBe(1);
    expect(r.longestStreak).toBe(1);
    expect(r.streakDays).toBe(1);
    expect(r.lastActiveDate).toBe(today);
    expect(r.streakBroken).toBe(false);
    expect(isActiveToday([today])).toBe(true);
  });

  it("counts consecutive days backward as a streak", () => {
    const today = new Date().toISOString().slice(0, 10);
    const d1 = new Date();
    d1.setUTCDate(d1.getUTCDate() - 1);
    const yesterday = d1.toISOString().slice(0, 10);
    const d2 = new Date();
    d2.setUTCDate(d2.getUTCDate() - 2);
    const dayBefore = d2.toISOString().slice(0, 10);

    const r = computeStreak([today, yesterday, dayBefore]);
    expect(r.currentStreak).toBe(3);
    expect(r.longestStreak).toBe(3);
    expect(r.streakDays).toBe(3);
  });

  it("deduplicates duplicate session dates", () => {
    const today = new Date().toISOString().slice(0, 10);
    const r = computeStreak([today, today, today]);
    expect(r.currentStreak).toBe(1);
    expect(r.streakDays).toBe(1);
  });

  it("marks streak broken when yesterday and today are both missed (grace)", () => {
    const today = new Date().toISOString().slice(0, 10);
    const d3 = new Date();
    d3.setUTCDate(d3.getUTCDate() - 3);
    const threeDaysAgo = d3.toISOString().slice(0, 10);

    // Active only three days ago; yesterday and today are missed.
    const r = computeStreak([threeDaysAgo]);
    expect(r.currentStreak).toBe(1);
    expect(r.longestStreak).toBe(1);
    expect(r.streakDays).toBe(1);
    expect(r.lastActiveDate).toBe(threeDaysAgo);
    expect(r.streakBroken).toBe(true); // last active (3 days ago) < yesterday
  });
});
