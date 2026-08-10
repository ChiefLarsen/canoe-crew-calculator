import { layoutSizes } from "./layouts";
import type { Assignment, Canoe, CanoeLayout, CanoeSeat, Role, Strategy } from "./types";

export interface Ranked {
  id: string;
  points: number;
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = out[i]!;
    out[i] = out[j]!;
    out[j] = a;
  }
  return out;
}

/** Order participants into a flat sequence that is then chopped into canoes. */
function orderForStrategy(ranked: Ranked[], strategy: Strategy): Ranked[] {
  if (strategy === "chaos") return shuffle(ranked);

  const sorted = [...ranked].sort((a, b) => b.points - a.points);
  if (strategy === "elite") return sorted;

  // balance: strongest remaining paired with weakest remaining
  const out: Ranked[] = [];
  let top = 0;
  let bottom = sorted.length - 1;
  while (top <= bottom) {
    out.push(sorted[top]!);
    top++;
    if (top <= bottom) {
      out.push(sorted[bottom]!);
      bottom--;
    }
  }
  return out;
}

function assignRoles(members: Ranked[]): CanoeSeat[] {
  const sorted = [...members].sort((a, b) => b.points - a.points);
  return sorted.map((member, index) => {
    let role: Role = "Bartender";
    let position = "I midten";
    if (index === 0) {
      role = "Styrmand";
      position = "Bagerst";
    } else if (index === sorted.length - 1) {
      role = "Motor";
      position = "Forrest";
    }
    return { participantId: member.id, role, position, points: member.points };
  });
}

export function allocate(
  ranked: Ranked[],
  layout: CanoeLayout,
  strategy: Strategy,
): Assignment {
  const ordered = orderForStrategy(ranked, strategy);
  const sizes = layoutSizes(layout);
  const canoes: Canoe[] = [];
  let cursor = 0;
  for (const size of sizes) {
    const members = ordered.slice(cursor, cursor + size);
    cursor += size;
    canoes.push({ size, seats: assignRoles(members) });
  }
  return { createdAt: Date.now(), strategy, canoes };
}

export const STRATEGY_LABELS: Record<Strategy, string> = {
  balance: "Jævnbyrdig",
  elite: "Elitær",
  chaos: "Kaos",
};

export const STRATEGY_DESCRIPTIONS: Record<Strategy, string> = {
  balance: "Bedste sættes sammen med dårligste – lige stærke kanoer.",
  elite: "Top med top, bund med bund – ingen nåde.",
  chaos: "Helt tilfældigt. Skæbnen bestemmer.",
};