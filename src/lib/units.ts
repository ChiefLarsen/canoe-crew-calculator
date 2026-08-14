import type { CompetitionCategory } from "./types";

export const CATEGORIES: { value: CompetitionCategory; label: string }[] = [
  { value: "tid", label: "Tid" },
  { value: "afstand", label: "Afstand" },
  { value: "vaegt", label: "Vægt" },
  { value: "lyd", label: "Lyd" },
  { value: "antal", label: "Antal/Point" },
];

export const UNITS: Record<CompetitionCategory, { value: string; label: string }[]> = {
  tid: [
    { value: "sek", label: "Sekunder (sek)" },
    { value: "min", label: "Minutter (min)" },
  ],
  afstand: [
    { value: "mm", label: "Millimeter (mm)" },
    { value: "cm", label: "Centimeter (cm)" },
    { value: "m", label: "Meter (m)" },
  ],
  vaegt: [
    { value: "g", label: "Gram (g)" },
    { value: "kg", label: "Kilogram (kg)" },
  ],
  lyd: [{ value: "dB", label: "Decibel (dB)" }],
  antal: [
    { value: "stk", label: "Stk" },
    { value: "point", label: "Point" },
  ],
};

export function defaultUnit(category: CompetitionCategory): string {
  return UNITS[category][0]!.value;
}

export function categoryLabel(category: CompetitionCategory): string {
  return CATEGORIES.find((c) => c.value === category)?.label ?? category;
}