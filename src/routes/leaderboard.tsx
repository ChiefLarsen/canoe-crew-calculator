import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { computeTotals, formatPoints } from "@/lib/scoring";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Stilling – Fordelingsnøgle Kanotur" },
      {
        name: "description",
        content: "Se den samlede stilling og pointfordelingen per disciplin.",
      },
      { property: "og:title", content: "Stilling – Fordelingsnøgle Kanotur" },
      {
        property: "og:description",
        content: "Se den samlede stilling og pointfordelingen per disciplin.",
      },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { activeParticipants, selectedCompetitions, state } = useStore();

  const { totals, breakdown } = useMemo(
    () => computeTotals(activeParticipants, selectedCompetitions, state.scores),
    [activeParticipants, selectedCompetitions, state.scores],
  );

  const ranked = useMemo(
    () =>
      [...activeParticipants].sort((a, b) => (totals[b.id] ?? 0) - (totals[a.id] ?? 0)),
    [activeParticipants, totals],
  );

  return (
    <AppShell title="Stilling" description="Samlet pointstilling på tværs af alle valgte discipliner.">
      {ranked.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Ingen aktive deltagere endnu.
        </p>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Accordion type="multiple" className="w-full">
              {ranked.map((p, index) => (
                <AccordionItem key={p.id} value={p.id}>
                  <AccordionTrigger className="gap-3">
                    <span className="flex flex-1 items-center gap-3 text-left">
                      <span
                        className={
                          index === 0
                            ? "flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground"
                            : "flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
                        }
                      >
                        {index === 0 ? <Trophy className="size-4" /> : index + 1}
                      </span>
                      <span className="truncate font-medium">{p.name}</span>
                    </span>
                    <span className="mr-2 font-display text-lg font-semibold text-primary">
                      {formatPoints(totals[p.id] ?? 0)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1.5 pl-11 text-sm">
                      {selectedCompetitions.map((c) => (
                        <li key={c.id} className="flex justify-between gap-3">
                          <span className="truncate text-muted-foreground">{c.name}</span>
                          <span>{formatPoints(breakdown[p.id]?.[c.id] ?? 0)} p</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}