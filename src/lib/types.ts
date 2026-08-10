export type ScoringDirection = "high" | "low";

export interface Group {
  id: string;
  name: string;
}

export interface Participant {
  id: string;
  name: string;
  groupId: string;
  active: boolean;
}

export interface Competition {
  id: string;
  name: string;
  unit: string;
  direction: ScoringDirection;
  multiplier: number;
  selected: boolean;
}

/** scores[competitionId][participantId] = raw value */
export type ScoreMap = Record<string, Record<string, number>>;

export type Strategy = "balance" | "elite" | "chaos";

export type Role = "Styrmand" | "Bartender" | "Motor";

export interface CanoeSeat {
  participantId: string;
  role: Role;
  position: string;
  points: number;
}

export interface Canoe {
  size: number;
  seats: CanoeSeat[];
}

export interface Assignment {
  createdAt: number;
  strategy: Strategy;
  canoes: Canoe[];
}

export interface CanoeLayout {
  twos: number;
  threes: number;
}

export interface AppState {
  version: number;
  groups: Group[];
  activeGroupId: string;
  participants: Participant[];
  competitions: Competition[];
  scores: ScoreMap;
  assignment: Assignment | null;
}