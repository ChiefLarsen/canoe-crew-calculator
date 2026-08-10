import type { CanoeLayout } from "./types";

/** All (twos, threes) combinations where 2a + 3b === n. */
export function canoeLayouts(n: number): CanoeLayout[] {
  const out: CanoeLayout[] = [];
  if (n < 2) return out;
  for (let threes = 0; threes * 3 <= n; threes++) {
    const rest = n - threes * 3;
    if (rest % 2 === 0) out.push({ twos: rest / 2, threes });
  }
  return out.sort((a, b) => a.twos + a.threes - (b.twos + b.threes) || b.twos - a.twos);
}

export function layoutLabel(layout: CanoeLayout): string {
  const parts: string[] = [];
  if (layout.twos > 0) parts.push(`${layout.twos}x 2-mands`);
  if (layout.threes > 0) parts.push(`${layout.threes}x 3-mands`);
  return parts.join(" + ");
}

export function layoutKey(layout: CanoeLayout): string {
  return `${layout.twos}-${layout.threes}`;
}

/** Canoe sizes for a layout, larger canoes first. */
export function layoutSizes(layout: CanoeLayout): number[] {
  return [...Array<number>(layout.threes).fill(3), ...Array<number>(layout.twos).fill(2)];
}