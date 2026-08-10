import type { AppState, Competition } from "./types";

function competition(
  id: string,
  name: string,
  unit: string,
  direction: "high" | "low",
): Competition {
  return { id, name, unit, direction, multiplier: 1, selected: true };
}

export const DEFAULT_COMPETITIONS: Competition[] = [
  competition("indiana-jones", "Indiana Jones", "gram afvigelse fra 500g", "low"),
  competition("ol-vaegt-gaet", "Øl-vægt gæt", "gram afvigelse efter en tår", "low"),
  competition("olkasse-balancen", "Ølkasse-balancen", "sekunder på ét ben", "high"),
  competition("kapsel-praecision", "Kapsel-præcision", "point ud af 5 kast", "high"),
  competition("somandsknuden", "Sømandsknuden", "sekunder", "low"),
  competition("elastik", "Øldrikning - Tættest på elastik", "mm afvigelse", "low"),
  competition("ol-pa-tid", "Øl på tid", "sekunder", "low"),
  competition("kapsel-op-knap", "Kapsel op-knap", "dB / afstandspoint", "high"),
  competition("musikquiz", "Musikquiz", "point", "high"),
  competition("shuffleboard", "Shuffleboard", "afstandspoint", "low"),
];

export const DEFAULT_GROUP_ID = "kanotur-2026";

export function initialState(): AppState {
  return {
    version: 1,
    groups: [{ id: DEFAULT_GROUP_ID, name: "Kanotur 2026" }],
    activeGroupId: DEFAULT_GROUP_ID,
    participants: [],
    competitions: DEFAULT_COMPETITIONS.map((c) => ({ ...c })),
    scores: {},
    assignment: null,
  };
}