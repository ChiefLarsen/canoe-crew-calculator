import type { AppState, Competition, CompetitionCategory } from "./types";

function competition(
  id: string,
  name: string,
  category: CompetitionCategory,
  unit: string,
  direction: "high" | "low",
  description: string,
): Competition {
  return { id, name, category, unit, direction, multiplier: 1, description };
}

export const DEFAULT_COMPETITIONS: Competition[] = [
  competition(
    "indiana-jones",
    "Indiana Jones",
    "vaegt",
    "g",
    "low",
    "Byt en pose sand med en øl uden at vække templet. Vi vejer posen bagefter – tættest på 500 g vinder.",
  ),
  competition(
    "ol-vaegt-gaet",
    "Øl-vægt gæt",
    "vaegt",
    "g",
    "low",
    "Tag én tår og gæt hvor meget øl der er tilbage. Afvigelsen i gram er din score.",
  ),
  competition(
    "olkasse-balancen",
    "Ølkasse-balancen",
    "tid",
    "sek",
    "high",
    "Stå på én fod på ølkassen så længe du kan. Fod i jorden = tiden stopper.",
  ),
  competition(
    "kapsel-praecision",
    "Kapsel-præcision",
    "antal",
    "point",
    "high",
    "Fem kapsler, ét krus. Ét point pr. kapsel der bliver liggende.",
  ),
  competition(
    "somandsknuden",
    "Sømandsknuden",
    "tid",
    "sek",
    "low",
    "Bind det rigtige sømandsknob på tid. Forkert knob = ny tid.",
  ),
  competition(
    "elastik",
    "Øldrikning - Tættest på elastik",
    "afstand",
    "mm",
    "low",
    "Drik ned til elastikken på flasken. Afstanden i mm fra elastikken tæller.",
  ),
  competition(
    "ol-pa-tid",
    "Øl på tid",
    "tid",
    "sek",
    "low",
    "Klassikeren. Én øl, hurtigst muligt, uden spild.",
  ),
  competition(
    "kapsel-op-knap",
    "Kapsel op-knap",
    "lyd",
    "dB",
    "high",
    "Åbn din øl så højt som muligt. Brug lydmåleren til at fange toppen.",
  ),
  competition(
    "musikquiz",
    "Musikquiz",
    "antal",
    "point",
    "high",
    "Ti intros fra bådradioen. Ét point pr. korrekt svar.",
  ),
  competition(
    "shuffleboard",
    "Shuffleboard",
    "afstand",
    "cm",
    "low",
    "Skub pucken tættest på kanten uden at falde af. Afstanden i cm er din score.",
  ),
];

export const DEFAULT_GROUP_ID = "kanotur-2026";

export function initialState(): AppState {
  return {
    version: 3,
    groups: [{ id: DEFAULT_GROUP_ID, name: "Kanotur 2026" }],
    participants: [],
    competitions: DEFAULT_COMPETITIONS.map((c) => ({ ...c })),
    session: null,
    history: [],
  };
}
