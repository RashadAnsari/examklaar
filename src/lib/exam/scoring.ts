// Returns the practice pass rate (0–1) for a given skill and level. DUO reports only pass or fail
// and publishes no cut scores, so these are practice targets, not official thresholds.
// Sources: commonly cited A2 counts for the fixed exam length, nt2.nl / levelupacademy.nl (B1).
// B1 rates are published percentages: the raw pass mark varies per administration due to IRT
// equating, so no fixed question count is used.
export function getPassRate(skill: string, level: string | null): number {
  const lvl = level?.toUpperCase() ?? null;
  if (skill === "knm") {
    return 28 / 40; // 0.700
  }
  if (skill === "reading") {
    return lvl === "B1" ? 0.65 : 19 / 25; // 0.650 or 0.760
  }
  if (skill === "listening") {
    return lvl === "B1" ? 0.65 : 18 / 25; // 0.650 or 0.720
  }
  // writing / speaking: DUO publishes no cut score. 60% matches the acceptable level its writing
  // models mark (adequacy 2, every other aspect 1 = 6/10 points).
  return 0.6;
}

// Minimum score needed to pass given the actual total for this exam.
export function getPassThreshold(skill: string, level: string | null, total: number): number {
  return Math.round(getPassRate(skill, level) * total);
}

// Returns true when the B1 threshold is a percentage approximation rather than a fixed count.
function isApproxThreshold(skill: string, level: string | null): boolean {
  return level?.toUpperCase() === "B1" && (skill === "reading" || skill === "listening");
}

// Percentage score as a 0–100 integer.
export function scorePct(score: number, total: number): number {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

// Pass context line shown beneath the hero percentage on the results page.
// e.g. "Pass: ≥70%"  or  "Pass: ≈65% (practice approximation)"
export function getPassContext(skill: string, level: string | null): string {
  if (skill === "writing" || skill === "speaking") {
    return "Pass: ≥60% of points";
  }
  const rate = getPassRate(skill, level);
  const pct = Math.round(rate * 100);
  const approx = isApproxThreshold(skill, level);
  return `Pass: ${approx ? "≈" : "≥"}${pct}%${approx ? " (practice approximation)" : ""}`;
}

// Pass / fail status used for the badge and score color on the results page.
export type PassStatus = {
  label: string;
  color: string;
  bg: string;
  passed: boolean;
};

export function getStatus(
  skill: string,
  level: string | null,
  score: number,
  total: number
): PassStatus {
  const passed = score >= getPassThreshold(skill, level, total);
  return {
    label: passed ? "Passed" : "Not yet passing",
    color: passed ? "var(--green-success)" : "var(--red)",
    bg: passed ? "var(--green-success-light)" : "var(--red-light)",
    passed,
  };
}

// One-line feedback shown in the exam list (exams/[id] page).
// e.g. "Passed: 85% (need 70%+)"  or  "Not yet passing: 65% (3 more correct needed)"
export function getScoreFeedback(
  skill: string,
  level: string | null,
  score: number,
  total: number
): { label: string; color: string } | null {
  const threshold = getPassThreshold(skill, level, total);
  const pct = scorePct(score, total);
  const rate = getPassRate(skill, level);
  const thresholdPct = Math.round(rate * 100);

  if (skill === "writing" || skill === "speaking") {
    // Compare points, as getStatus does: a 37-point writing exam passes at 22 points, which is 59%
    return score >= threshold
      ? { label: `Passed: ${pct}% (need 60%+)`, color: "var(--green-700)" }
      : {
          label: `Not yet passing: ${pct}% (need ${threshold}/${total} pts)`,
          color: "var(--red)",
        };
  }

  const approx = isApproxThreshold(skill, level);
  if (score >= threshold) {
    return {
      label: `Passed: ${pct}% (need ${approx ? "≈" : ""}${thresholdPct}%+)`,
      color: "var(--green-700)",
    };
  }
  return {
    label: `Not yet passing: ${pct}% (${threshold - score} more correct needed)`,
    color: "var(--red)",
  };
}

// History stats for the stat cards on the results page.
export type HistoryStats = {
  bestPct: number;
  avgPct: number;
  isPersonalBest: boolean;
};

export function computeHistoryStats(
  allResults: { score: number; total_score: number }[],
  currentScore: number
): HistoryStats {
  if (allResults.length === 0) {
    return { bestPct: 0, avgPct: 0, isPersonalBest: true };
  }
  const pcts = allResults.map((r) => (r.total_score > 0 ? r.score / r.total_score : 0));
  const bestPct = Math.round(Math.max(...pcts) * 100);
  const avgPct = Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 100);
  const isPersonalBest = allResults.every((r) => currentScore >= r.score);
  return { bestPct, avgPct, isPersonalBest };
}
