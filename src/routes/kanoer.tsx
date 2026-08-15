import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Dices, Ship } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { NoSession } from "@/components/NoSession";
import { SessionNav } from "@/components/SessionNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { allocate, STRATEGY_DESCRIPTIONS, STRATEGY_LABELS } from "@/lib/allocation";
import { canoeLayouts, layoutKey, layoutLabel } from "@/lib/layouts";
import { computeTotals } from "@/lib/scoring";
import { useStore } from "@/lib/store";
import type { Strategy } from "@/lib/types";

export const Route = createFileRoute("/kanoer")({
  head: () => ({
    meta: [
      { title: "Kanofordeling – Fordelingsnøgle Kanotur" },
      {
        name: "description",
        content: "Vælg kanoopstilling og fordelingsstrategi – 2-mands først, 3-mands til sidst.",
      },
      { property: "og:title", content: "Kanofordeling – Fordelingsnøgle Kanotur" },
      {
        property: "og:description",
        content: "Vælg kanoopstilling og fordelingsstrategi – 2-mands først, 3-mands til sidst.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CanoesPage,
});

const STRATEGIES: Strategy[] = ["balance", "elite", "chaos"];

function CanoesPage() {
  const { session, setAssignment } = useStore();
  const navigate = useNavigate();

  const participants = useMemo(() => session?.participants ?? [], [session]);
  const layouts = useMemo(() => canoeLayouts(participants.length), [participants]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [strategy, setStrategy] = useState<Strategy>("balance");
  const [bonus, setBonus] = useState<Record<string, number>>({});
  const [duel, setDuel] = useState<string[] | null>(null);

  useEffect(() => {
    if (layouts.length === 0) {
      setSelectedKey("");
    } else if (!layouts.some((l) => layoutKey(l) === selectedKey)) {
      setSelectedKey(layoutKey(layouts[0]!));
    }
  }, [layouts, selectedKey]);

  const totals = useMemo(() => {
    if (!session) return {};
    return computeTotals(session.participants, session.competitions, session.scores, {
      leaderId: session.leaderId,
      captainId: session.captainId,
    }).totals;
  }, [session]);

  if (!session) return <NoSession title="Kanoer" />;

  const rankPoints = (id: string) => (totals[id] ?? 0) + (bonus[id] ?? 0);

  /** Returns the first group of participants sharing the exact same ranking points. */
  const findTie = (): string[] | null => {
    const byPoints = new Map<number, string[]>();
    for (const p of participants) {
      const value = rankPoints(p.id);
      byPoints.set(value, [...(byPoints.get(value) ?? []), p.id]);
    }
    for (const ids of byPoints.values()) if (ids.length > 1) return ids;
    return null;
  };

  const runAllocation = (extra: Record<string, number>) => {
    const layout = layouts.find((l) => layoutKey(l) === selectedKey);
    if (!layout) return;
    const ranked = participants.map((p) => ({
      id: p.id,
      points: (totals[p.id] ?? 0) + (extra[p.id] ?? 0),
    }));
    setAssignment(allocate(ranked, layout, strategy));
    toast.success("Kanoerne er fordelt!");
    void navigate({ to: "/oversigt" });
  };

  const generate = () => {
    const tie = findTie();
    if (tie) {
      setDuel(tie);
      return;
    }
    runAllocation(bonus);
  };

  const resolveDuel = (winnerId: string) => {
    const next = { ...bonus, [winnerId]: (bonus[winnerId] ?? 0) + 0.1 };
    setBonus(next);
    setDuel(null);
    // Look for the next tie using the updated points.
    const value = (id: string) => (totals[id] ?? 0) + (next[id] ?? 0);
    const byPoints = new Map<number, string[]>();
    for (const p of participants) byPoints.set(value(p.id), [...(byPoints.get(value(p.id)) ?? []), p.id]);
    const remaining = [...byPoints.values()].find((ids) => ids.length > 1);
    if (remaining) {
      setDuel(remaining);
      return;
    }
    runAllocation(next);
  };

  const nameOf = (id: string) => participants.find((p) => p.id === id)?.name ?? id;

  return (
    <AppShell
      title="Kanoer"
      description={`${participants.length} deltagere. 2-mands kanoer fyldes først, 3-mands til sidst.`}
      subnav={<SessionNav />}
    >
      {layouts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Antallet af deltagere ({participants.length}) kan ikke deles op i kanoer med 2 og 3
          pladser.
        </p>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Kanoopstilling</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {layouts.map((layout) => {
                const key = layoutKey(layout);
                const active = key === selectedKey;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    className={
                      active
                        ? "flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/10 p-3 text-left"
                        : "flex items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted"
                    }
                  >
                    <Ship className="size-5 shrink-0 text-primary" />
                    <span className="text-sm font-medium">{layoutLabel(layout)}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {layout.twos + layout.threes} kanoer
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fordelingsstrategi</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {STRATEGIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStrategy(s)}
                  className={
                    s === strategy
                      ? "rounded-xl border-2 border-primary bg-primary/10 p-3 text-left"
                      : "rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted"
                  }
                >
                  <p className="text-sm font-semibold">{STRATEGY_LABELS[s]}</p>
                  <p className="text-xs text-muted-foreground">{STRATEGY_DESCRIPTIONS[s]}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={generate}>
            <Dices className="size-4" /> Fordel kanoerne
          </Button>

          <Dialog open={duel !== null} onOpenChange={(open) => !open && setDuel(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl">DØDT LØB!</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Deathmatch nødvendig mellem {duel?.map(nameOf).join(" og ")}. Afgør det fysisk
                (sten-saks-papir) og tryk på vinderen.
              </p>
              <div className="grid gap-2">
                {duel?.map((id) => (
                  <Button
                    key={id}
                    size="lg"
                    className="h-14 text-base"
                    onClick={() => resolveDuel(id)}
                  >
                    {nameOf(id)} vandt
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </AppShell>
  );
}
