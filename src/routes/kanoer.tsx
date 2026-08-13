import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Dices, Ship } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { NoSession } from "@/components/NoSession";
import { SessionNav } from "@/components/SessionNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const generate = () => {
    const layout = layouts.find((l) => layoutKey(l) === selectedKey);
    if (!layout) return;
    const ranked = participants.map((p) => ({ id: p.id, points: totals[p.id] ?? 0 }));
    setAssignment(allocate(ranked, layout, strategy));
    toast.success("Kanoerne er fordelt!");
    void navigate({ to: "/oversigt" });
  };

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
        </>
      )}
    </AppShell>
  );
}
