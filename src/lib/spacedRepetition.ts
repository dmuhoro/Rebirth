/**
 * Rebirth spaced-repetition scheduler (Phase 4).
 *
 * SM-2 algorithm for review cards (Hebrew/Greek terms, verses). Pure, testable
 * logic. Each review produces a new ease factor, interval, and due date.
 *
 * SM-2 rules:
 * - Quality q (0-5): how well the user recalled the item.
 * - If q < 3: repetitions = 1, interval = 1 day (reset, relearn).
 * - If q >= 3: interval = (repetitions === 1 ? 1 : repetitions === 2 ? 6 :
 *   round(previousInterval * easeFactor)); repetitions += 1.
 * - New ease factor: ef' = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)).
 *   Clamp ef to minimum 1.3.
 * - Due date = now + interval days.
 */

export type Sm2CardState = {
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  dueAt: number; // epoch ms
};

export type Sm2ReviewResult = {
  newState: Sm2CardState;
  quality: number; // 0-5
  reviewedAt: number;
};

const MIN_EASE_FACTOR = 1.3;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Create a fresh card state (first review pending). */
export function createCardState(now: number = Date.now()): Sm2CardState {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    dueAt: now, // due immediately for first review
  };
}

/**
 * Apply an SM-2 review to a card state.
 * @param state current card state
 * @param quality recall quality 0-5 (5 = perfect, 0 = complete blackout)
 * @param now epoch ms (default Date.now())
 */
export function reviewCard(
  state: Sm2CardState,
  quality: number,
  now: number = Date.now()
): Sm2ReviewResult {
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  let { easeFactor, interval, repetitions } = state;

  if (q < 3) {
    // Failed: reset repetitions and interval, keep a reduced ease factor.
    repetitions = 1;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor.
  easeFactor =
    easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < MIN_EASE_FACTOR) {
    easeFactor = MIN_EASE_FACTOR;
  }

  const newState: Sm2CardState = {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    dueAt: now + interval * MS_PER_DAY,
  };

  return { newState, quality: q, reviewedAt: now };
}

/** Whether a card is due for review now. */
export function isDue(state: Sm2CardState, now: number = Date.now()): boolean {
  return now >= state.dueAt;
}

/** Sort cards by due date (soonest first), then by overdue amount. */
export function sortByDue(cards: Sm2CardState[], now: number = Date.now()): Sm2CardState[] {
  return [...cards].sort((a, b) => a.dueAt - b.dueAt);
}
