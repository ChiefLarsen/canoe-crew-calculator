import type { Competition, ScoreMap, SessionParticipant, Standing } from "./types";

export const LEADER_FACTOR = 3;
export const CAPTAIN_FACTOR = 10;

export const LEADER_BADGE = "🧭";
export const CAPTAIN_BADGE = "🧢";

export interface RoleHolders {
  leaderId?: string | null;
  captainId?: string | null;
}

/** Advantage factor for a participant: Kaptajn 10x, Ekspeditionsleder 3x, ellers 1x. */
export function advantageFactor(participantId: string, roles: RoleHolders): number {
  if (roles.captainId === participantId) return CAPTAIN_FACTOR;
  if (roles.leaderId === participantId) return LEADER_FACTOR;
  return 1;
}

export function effectiveScore(
  raw: number,
  direction: Competition["direction"],
  factor: number,
): number {
  return direction === "low" ? raw / factor : raw * factor;
}

/**
 * Rank points for one competition, based on effective (advantage-adjusted) scores.
 * N scored participants -> best gets N points, worst gets 1. Ties share the best rank.
 */
export function competitionPoints(
  competition: Competition,
  entries: Record<string, number> | undefined,
  participantIds: string[],
  roles: RoleHolders = {},
): Record<string, number> {
  const scored: { id: string; value: number }[] = [];
  for (const id of participantIds) {
    const value = entries?.[id];
    if (typeof value === "number" && !Number.isNaN(value)) {
      scored.push({
        id,
        value: effectiveScore(value, competition.direction, advantageFactor(id, roles)),
      });
    }
  }

  const n = scored.length;
  const out: Record<string, number> = {};
  if (n === 0) return out;

  scored.sort((a, b) => (competition.direction === "low" ? a.value - b.value : b.value - a.value));

  let index = 0;
  while (index < scored.length) {
    const current = scored[index]!;
    let end = index;
    while (end + 1 < scored.length && scored[end + 1]!.value === current.value) end++;
    const points = (n - index) * competition.multiplier;
    for (let i = index; i <= end; i++) out[scored[i]!.id] = points;
    index = end + 1;
  }
  return out;
}

export interface Totals {
  totals: Record<string, number>;
  breakdown: Record<string, Record<string, number>>;
}

export function computeTotals(
  participants: SessionParticipant[],
  competitions: Competition[],
  scores: ScoreMap,
  roles: RoleHolders = {},
): Totals {
  const ids = participants.map((p) => p.id);
  const totals: Record<string, number> = {};
  const breakdown: Record<string, Record<string, number>> = {};
  for (const id of ids) {
    totals[id] = 0;
    breakdown[id] = {};
  }

  for (const competition of competitions) {
    const points = competitionPoints(competition, scores[competition.id], ids, roles);
    for (const id of ids) {
      const p = points[id] ?? 0;
      breakdown[id]![competition.id] = p;
      totals[id] = (totals[id] ?? 0) + p;
    }
  }
  return { totals, breakdown };
}

export function computeStandings(
  participants: SessionParticipant[],
  competitions: Competition[],
  scores: ScoreMap,
  roles: RoleHolders = {},
): Standing[] {
  const { totals } = computeTotals(participants, competitions, scores, roles);
  return participants
    .map((p) => ({ id: p.id, name: p.name, points: totals[p.id] ?? 0 }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, "da"));
}

export function formatPoints(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function roleBadge(participantId: string, roles: RoleHolders): string {
  if (roles.captainId === participantId) return CAPTAIN_BADGE;
  if (roles.leaderId === participantId) return LEADER_BADGE;
  return "";
}
