import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { NoSession } from "@/components/NoSession";
import { PersonName } from "@/components/PersonName";
import { SessionNav } from "@/components/SessionNav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { computeTotals, formatPoints } from "@/lib/scoring";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/stilling")({
  head: () => ({
    meta: [
      { title: "Stilling – Fordelingsnøgle Kanotur" },
      {
        name: "description",
        content: "Live stilling for sessionen med point pr. disciplin og rollebonusser.",
      },
      { property: "og:title", content: "Stilling – Fordelingsnøgle Kanotur" },
      {
        property: "og:description",
        content: "Live stilling for sessionen med point pr. disciplin og rollebonusser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StandingsPage,
});

function StandingsPage() {
  const { session } = useStore();
  const roles = { leaderId: session?.leaderId, captainId: session?.captainId };

  const { rows, breakdown } = useMemo(() => {
    if (!session) return { rows: [], breakdown: {} as Record<string, Record<string, number>> };
    const { totals, breakdown } = computeTotals(
      session.participants,
      session.competitions,
      session.scores,
      roles,
    );
    const rows = session.participants
      .map((p) => ({ ...p, points: totals[p.id] ?? 0 }))
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, "da"));
    return { rows, breakdown };
  }, [session, roles]);

  if (!session) return <NoSession title="Stilling" />;

  return (
    <AppShell
      title="Stilling"
      description="Point fra alle discipliner – bedste placering giver flest point."
      subnav={<SessionNav />}
    >
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {rows.map((row, index) => (
              <li key={row.id} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 shrink-0 font-display text-lg">{index + 1}</span>
                  <PersonName
                    id={row.id}
                    name={row.name}
                    roles={roles}
                    className="flex-1 text-sm font-medium"
                  />
                  <Badge>{formatPoints(row.points)} p</Badge>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1 pl-9">
                  {session.competitions.map((c) => (
                    <span
                      key={c.id}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {c.name}: {formatPoints(breakdown[row.id]?.[c.id] ?? 0)}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </AppShell>
  );
}
