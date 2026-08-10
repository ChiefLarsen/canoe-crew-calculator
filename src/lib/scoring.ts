import type { Competition, Participant, ScoreMap } from "./types";

/**
 * Rank points for one competition.
 * N scored participants -> best gets N points, worst gets 1.
 * Ties share the points of the best rank in the tie.
 * Result is multiplied by the competition multiplier.
 */
export function competitionPoints(
  competition: Competition,
  entries: Record<string, number> | undefined,
  participantIds: string[],
): Record<string, number> {
  const scored = participantIds
    .filter((id) => entries && typeof entries[id] === "number" && !Number.isNaN(entries[id]))
    .map((id) => ({ id, value: entries![id] }));

  const n = scored.length;
  const out: Record<string, number> = {};
  if (n === 0) return out;

  scored.sort((a, b) =>
    competition.direction === "low" ? a.value - b.value : b.value - a.value,
  );

  let index = 0;
  while (index < scored.length) {
    let end = index;
    while (end + 1 < scored.length && scored[end + 1].value === scored[index].value) end++;
    const points = (n - index) * competition.multiplier;
    for (let i = index; i <= end; i++) out[scored[i].id] = points;
    index = end + 1;
  }
  return out;
}

export interface Totals {
  /** totals[participantId] = total points */
  totals: Record<string, number>;
  /** breakdown[participantId][competitionId] = points */
  breakdown: Record<string, Record<string, number>>;
}

export function computeTotals(
  participants: Participant[],
  competitions: Competition[],
  scores: ScoreMap,
): Totals {
  const ids = participants.map((p) => p.id);
  const totals: Record<string, number> = {};
  const breakdown: Record<string, Record<string, number>> = {};
  for (const id of ids) {
    totals[id] = 0;
    breakdown[id] = {};
  }

  for (const competition of competitions) {
    const points = competitionPoints(competition, scores[competition.id], ids);
    for (const id of ids) {
      const p = points[id] ?? 0;
      breakdown[id][competition.id] = p;
      totals[id] += p;
    }
  }
  return { totals, breakdown };
}

export function formatPoints(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}