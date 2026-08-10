import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialState } from "./seed";
import type {
  AppState,
  Assignment,
  Competition,
  Group,
  Participant,
} from "./types";

const STORAGE_KEY = "fordelingsnogle-kanotur-v1";

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface StoreValue {
  state: AppState;
  hydrated: boolean;
  activeGroup: Group | undefined;
  groupParticipants: Participant[];
  activeParticipants: Participant[];
  selectedCompetitions: Competition[];
  addGroup: (name: string) => void;
  renameGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
  setActiveGroup: (id: string) => void;
  addParticipant: (name: string) => void;
  updateParticipant: (id: string, patch: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  addCompetition: (competition: Omit<Competition, "id">) => void;
  updateCompetition: (id: string, patch: Partial<Competition>) => void;
  deleteCompetition: (id: string) => void;
  setScore: (competitionId: string, participantId: string, value: number | null) => void;
  clearScores: (competitionId: string) => void;
  setAssignment: (assignment: Assignment | null) => void;
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
        if (parsed && Array.isArray(parsed.participants)) {
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
    const groupParticipants = state.participants.filter(
      (p) => p.groupId === state.activeGroupId,
    );
    const patch = (updater: (prev: AppState) => AppState) => setState(updater);

    return {
      state,
      hydrated,
      activeGroup: state.groups.find((g) => g.id === state.activeGroupId),
      groupParticipants,
      activeParticipants: groupParticipants.filter((p) => p.active),
      selectedCompetitions: state.competitions.filter((c) => c.selected),
      addGroup: (name) =>
        patch((prev) => {
          const group = { id: uid(), name };
          return { ...prev, groups: [...prev.groups, group], activeGroupId: group.id };
        }),
      renameGroup: (id, name) =>
        patch((prev) => ({
          ...prev,
          groups: prev.groups.map((g) => (g.id === id ? { ...g, name } : g)),
        })),
      deleteGroup: (id) =>
        patch((prev) => {
          const groups = prev.groups.filter((g) => g.id !== id);
          if (groups.length === 0) return prev;
          return {
            ...prev,
            groups,
            participants: prev.participants.filter((p) => p.groupId !== id),
            activeGroupId: prev.activeGroupId === id ? groups[0]!.id : prev.activeGroupId,
            assignment: null,
          };
        }),
      setActiveGroup: (id) => patch((prev) => ({ ...prev, activeGroupId: id, assignment: null })),
      addParticipant: (name) =>
        patch((prev) => ({
          ...prev,
          participants: [
            ...prev.participants,
            { id: uid(), name, groupId: prev.activeGroupId, active: true },
          ],
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
        patch((prev) => {
          const scores = { ...prev.scores };
          delete scores[id];
          return {
            ...prev,
            competitions: prev.competitions.filter((c) => c.id !== id),
            scores,
          };
        }),
      setScore: (competitionId, participantId, val) =>
        patch((prev) => {
          const entries = { ...(prev.scores[competitionId] ?? {}) };
          if (val === null || Number.isNaN(val)) delete entries[participantId];
          else entries[participantId] = val;
          return { ...prev, scores: { ...prev.scores, [competitionId]: entries } };
        }),
      clearScores: (competitionId) =>
        patch((prev) => ({ ...prev, scores: { ...prev.scores, [competitionId]: {} } })),
      setAssignment: (assignment) => patch((prev) => ({ ...prev, assignment })),
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