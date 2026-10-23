import { describe, it, expect } from "vitest";
import {
  createCardState,
  reviewCard,
  isDue,
  sortByDue,
  type Sm2CardState,
} from "../lib/spacedRepetition";

describe("Spaced repetition SM-2 scheduler (Phase 4)", () => {
  const now = 1_700_000_000_000; // fixed epoch for deterministic tests

  it("creates a fresh card due immediately", () => {
    const s = createCardState(now);
    expect(s.repetitions).toBe(0);
    expect(s.interval).toBe(0);
    expect(s.easeFactor).toBe(2.5);
    expect(isDue(s, now)).toBe(true);
  });

  it("first successful review sets interval to 1 day", () => {
    const s = createCardState(now);
    const r = reviewCard(s, 5, now);
    expect(r.newState.repetitions).toBe(1);
    expect(r.newState.interval).toBe(1);
    expect(r.newState.dueAt).toBe(now + 1 * 24 * 60 * 60 * 1000);
    expect(isDue(r.newState, now)).toBe(false);
  });

  it("second successful review sets interval to 6 days", () => {
    const s = createCardState(now);
    const r1 = reviewCard(s, 5, now);
    const r2 = reviewCard(r1.newState, 5, r1.newState.dueAt);
    expect(r2.newState.repetitions).toBe(2);
    expect(r2.newState.interval).toBe(6);
  });

  it("failed review (q < 3) resets to interval 1 and repetitions 1", () => {
    const s = createCardState(now);
    const good = reviewCard(s, 5, now); // reps=1, interval=1
    const failed = reviewCard(good.newState, 1, good.newState.dueAt);
    expect(failed.newState.repetitions).toBe(1);
    expect(failed.newState.interval).toBe(1);
  });

  it("clamps ease factor to minimum 1.3", () => {
    let s = createCardState(now);
    // Repeated worst-quality reviews drive ease factor down.
    for (let i = 0; i < 20; i++) {
      const r = reviewCard(s, 0, s.dueAt);
      s = r.newState;
    }
    expect(s.easeFactor).toBeGreaterThanOrEqual(1.3);
    expect(s.easeFactor).toBeLessThanOrEqual(2.5);
  });

  it("higher quality produces longer intervals over time", () => {
    let s5 = createCardState(now);
    let s3 = createCardState(now);
    for (let i = 0; i < 4; i++) {
      const r5 = reviewCard(s5, 5, s5.dueAt);
      s5 = r5.newState;
      const r3 = reviewCard(s3, 3, s3.dueAt);
      s3 = r3.newState;
    }
    // Ease factor for quality 5 stays higher than quality 3 over time.
    expect(s5.easeFactor).toBeGreaterThanOrEqual(s3.easeFactor);
  });

  it("sortByDue orders soonest first", () => {
    const base: Sm2CardState = {
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      dueAt: now,
    };
    const cards = [
      { ...base, dueAt: now + 10 * 24 * 60 * 60 * 1000 },
      { ...base, dueAt: now + 1 * 24 * 60 * 60 * 1000 },
      { ...base, dueAt: now + 5 * 24 * 60 * 60 * 1000 },
    ];
    const sorted = sortByDue(cards, now);
    expect(sorted[0].dueAt).toBe(now + 1 * 24 * 60 * 60 * 1000);
    expect(sorted[1].dueAt).toBe(now + 5 * 24 * 60 * 60 * 1000);
    expect(sorted[2].dueAt).toBe(now + 10 * 24 * 60 * 60 * 1000);
  });

  it("clamps quality to 0-5 range", () => {
    const s = createCardState(now);
    const r1 = reviewCard(s, 9, now);
    expect(r1.quality).toBe(5);
    const r2 = reviewCard(s, -4, now);
    expect(r2.quality).toBe(0);
  });
});
