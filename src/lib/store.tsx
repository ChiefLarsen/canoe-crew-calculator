import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { computeStandings } from "./scoring";
import { initialState } from "./seed";
import type {
  AppState,
  Assignment,
  Competition,
  Group,
  HistoryEntry,
  Participant,
  Session,
} from "./types";

const STORAGE_KEY = "fordelingsnogle-kanotur-v3";

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export interface StartSessionInput {
  name: string;
  groupId: string;
  participantIds: string[];
  competitionIds: string[];
  leaderId: string | null;
  captainId: string | null;
}

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  session: Session | null;
  addGroup: (name: string) => string;
  renameGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
  participantsOf: (groupId: string) => Participant[];
  addParticipant: (groupId: string, name: string) => void;
  updateParticipant: (id: string, patch: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  addCompetition: (competition: Omit<Competition, "id">) => void;
  updateCompetition: (id: string, patch: Partial<Competition>) => void;
  deleteCompetition: (id: string) => void;
  startSession: (input: StartSessionInput) => void;
  setScore: (competitionId: string, participantId: string, value: number | null) => void;
  clearScores: (competitionId: string) => void;
  setAssignment: (assignment: Assignment | null) => void;
  endSession: () => void;
  discardSession: () => void;
  deleteHistoryEntry: (id: string) => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => initialState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed && parsed.version === 3 && Array.isArray(parsed.participants)) {
          setState({ ...initialState(), ...parsed });
        }
      }
    } catch {
      /* ignore corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [state, hydrated]);

  const value = useMemo<StoreValue>(() => {
    const patch = (updater: (prev: AppState) => AppState) => setState(updater);
    const patchSession = (updater: (session: Session) => Session) =>
      patch((prev) => (prev.session ? { ...prev, session: updater(prev.session) } : prev));

    return {
      state,
      hydrated,
      session: state.session,
      addGroup: (name) => {
        const group: Group = { id: uid(), name };
        patch((prev) => ({ ...prev, groups: [...prev.groups, group] }));
        return group.id;
      },
      renameGroup: (id, name) =>
        patch((prev) => ({
          ...prev,
          groups: prev.groups.map((g) => (g.id === id ? { ...g, name } : g)),
        })),
      deleteGroup: (id) =>
        patch((prev) => ({
          ...prev,
          groups: prev.groups.filter((g) => g.id !== id),
          participants: prev.participants.filter((p) => p.groupId !== id),
        })),
      participantsOf: (groupId) => state.participants.filter((p) => p.groupId === groupId),
      addParticipant: (groupId, name) =>
        patch((prev) => ({
          ...prev,
          participants: [...prev.participants, { id: uid(), name, groupId }],
        })),
      updateParticipant: (id, p) =>
        patch((prev) => ({
          ...prev,
          participants: prev.participants.map((x) => (x.id === id ? { ...x, ...p } : x)),
        })),
      deleteParticipant: (id) =>
        patch((prev) => ({
          ...prev,
          participants: prev.participants.filter((x) => x.id !== id),
        })),
      addCompetition: (competition) =>
        patch((prev) => ({
          ...prev,
          competitions: [...prev.competitions, { ...competition, id: uid() }],
        })),
      updateCompetition: (id, p) =>
        patch((prev) => ({
          ...prev,
          competitions: prev.competitions.map((c) => (c.id === id ? { ...c, ...p } : c)),
        })),
      deleteCompetition: (id) =>
        patch((prev) => ({ ...prev, competitions: prev.competitions.filter((c) => c.id !== id) })),
      startSession: (input) =>
        patch((prev) => {
          const group = prev.groups.find((g) => g.id === input.groupId);
          const participants = prev.participants
            .filter((p) => p.groupId === input.groupId && input.participantIds.includes(p.id))
            .map((p) => ({ id: p.id, name: p.name }));
          const competitions = prev.competitions
            .filter((c) => input.competitionIds.includes(c.id))
            .map((c) => ({ ...c }));
          const session: Session = {
            id: uid(),
            createdAt: Date.now(),
            groupId: input.groupId,
            groupName: group?.name ?? "Kanotur",
            name: input.name.trim() || group?.name || "Kanotur",
            participants,
            competitions,
            leaderId: input.leaderId,
            captainId: input.captainId,
            scores: {},
            assignment: null,
          };
          return { ...prev, session };
        }),
      setScore: (competitionId, participantId, val) =>
        patchSession((session) => {
          const entries = { ...(session.scores[competitionId] ?? {}) };
          if (val === null || Number.isNaN(val)) delete entries[participantId];
          else entries[participantId] = val;
          return { ...session, scores: { ...session.scores, [competitionId]: entries } };
        }),
      clearScores: (competitionId) =>
        patchSession((session) => ({
          ...session,
          scores: { ...session.scores, [competitionId]: {} },
        })),
      setAssignment: (assignment) => patchSession((session) => ({ ...session, assignment })),
      endSession: () =>
        patch((prev) => {
          if (!prev.session) return prev;
          const s = prev.session;
          const entry: HistoryEntry = {
            ...s,
            endedAt: Date.now(),
            standings: computeStandings(s.participants, s.competitions, s.scores, {
              leaderId: s.leaderId,
              captainId: s.captainId,
            }),
          };
          return { ...prev, session: null, history: [entry, ...prev.history] };
        }),
      discardSession: () => patch((prev) => ({ ...prev, session: null })),
      deleteHistoryEntry: (id) =>
        patch((prev) => ({ ...prev, history: prev.history.filter((h) => h.id !== id) })),
      resetAll: () => setState(initialState()),
    };
  }, [state, hydrated]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function useThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("fordelingsnogle-theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("fordelingsnogle-theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return { dark, toggle };
}
