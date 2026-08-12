export type ScoringDirection = "high" | "low";

export interface Group {
  id: string;
  name: string;
}

export interface Participant {
  id: string;
  name: string;
  groupId: string;
}

export interface Competition {
  id: string;
  name: string;
  unit: string;
  description: string;
  direction: ScoringDirection;
  multiplier: number;
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

export interface SessionParticipant {
  id: string;
  name: string;
}

export interface Session {
  id: string;
  createdAt: number;
  groupId: string;
  groupName: string;
  /** Snapshot of the participants taking part in this session. */
  participants: SessionParticipant[];
  /** Snapshot of the competitions used in this session. */
  competitions: Competition[];
  leaderId: string | null;
  captainId: string | null;
  scores: ScoreMap;
  assignment: Assignment | null;
}

export interface Standing {
  id: string;
  name: string;
  points: number;
}

export interface HistoryEntry extends Session {
  endedAt: number;
  standings: Standing[];
}

export interface AppState {
  version: number;
  groups: Group[];
  participants: Participant[];
  competitions: Competition[];
  session: Session | null;
  history: HistoryEntry[];
}
