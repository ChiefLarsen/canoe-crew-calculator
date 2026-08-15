import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Eraser, Ship } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { NoSession } from "@/components/NoSession";
import { PersonName } from "@/components/PersonName";
import { ScoreTools } from "@/components/ScoreTools";
import { SessionNav } from "@/components/SessionNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { competitionPoints, formatPoints } from "@/lib/scoring";
import { useStore } from "@/lib/store";
import { categoryLabel } from "@/lib/units";

export const Route = createFileRoute("/scores")({
  head: () => ({
    meta: [
      { title: "Scoreindtastning – Fordelingsnøgle Kanotur" },
      {
        name: "description",
        content:
          "Tast resultater ind med stopur, lydmåler og numpad – point beregnes med det samme.",
      },
      { property: "og:title", content: "Scoreindtastning – Fordelingsnøgle Kanotur" },
      {
        property: "og:description",
        content:
          "Tast resultater ind med stopur, lydmåler og numpad – point beregnes med det samme.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScoresPage,
});

function ScoresPage() {
  const { session, setScore, clearScores } = useStore();
  const [competitionId, setCompetitionId] = useState<string>("");

  const competitions = session?.competitions ?? [];

  useEffect(() => {
    if (competitions.length === 0) {
      setCompetitionId("");
      return;
    }
    if (!competitions.some((c) => c.id === competitionId)) {
      setCompetitionId(competitions[0]!.id);
    }
  }, [competitions, competitionId]);

  const competition = competitions.find((c) => c.id === competitionId);
  const entries = competition && session ? session.scores[competition.id] : undefined;
  const participants = session?.participants ?? [];
  const roles = { leaderId: session?.leaderId, captainId: session?.captainId };

  const completion = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const c of competitions) {
      const e = session?.scores[c.id];
      map[c.id] =
        participants.length > 0 &&
        participants.every((p) => typeof e?.[p.id] === "number" && !Number.isNaN(e[p.id]));
    }
    return map;
  }, [competitions, participants, session]);

  const allDone = competitions.length > 0 && competitions.every((c) => completion[c.id]);

  const points = useMemo(() => {
    if (!competition) return {};
    return competitionPoints(
      competition,
      entries,
      participants.map((p) => p.id),
      roles,
    );
  }, [competition, entries, participants, roles]);

  if (!session) return <NoSession title="Scores" />;

  return (
    <AppShell
      title="Scores"
      description="Vælg disciplin og tast resultaterne – brug måleværktøjerne hvis du er i tvivl."
      subnav={<SessionNav />}
    >
      <div className="grid grid-cols-2 gap-2">
        {competitions.map((c) => {
          const active = c.id === competitionId;
          const done = completion[c.id];
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCompetitionId(c.id)}
              className={
                active
                  ? "flex min-h-20 flex-col justify-between gap-1 rounded-xl border-2 border-primary bg-primary/10 p-3 text-left"
                  : "flex min-h-20 flex-col justify-between gap-1 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted"
              }
            >
              <span className="text-sm font-semibold leading-tight">{c.name}</span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {done ? (
                  <>
                    <CheckCircle2 className="size-5 text-[hsl(142_70%_40%)]" />
                    Færdig
                  </>
                ) : (
                  <>
                    {
                      participants.filter(
                        (p) => typeof session.scores[c.id]?.[p.id] === "number",
                      ).length
                    }
                    /{participants.length} tastet
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {allDone ? (
        <Button asChild size="lg" className="w-full">
          <Link to="/kanoer">
            <Ship className="size-4" /> Videre til kanofordeling
          </Link>
        </Button>
      ) : (
        <Button size="lg" className="w-full" disabled>
          <Ship className="size-4" /> Alle discipliner skal tastes færdigt
        </Button>
      )}

      {competition ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
            <div className="min-w-0">
              <CardTitle className="text-base">{competition.name}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {categoryLabel(competition.category)} ({competition.unit}) ·{" "}
                {competition.direction === "low" ? "Lavt er bedst" : "Højt er bedst"} ·{" "}
                {competition.multiplier}x
              </p>
              {competition.description ? (
                <p className="mt-2 text-xs text-muted-foreground">{competition.description}</p>
              ) : null}
            </div>
            <Button variant="ghost" size="sm" onClick={() => clearScores(competition.id)}>
              <Eraser className="size-4" /> Ryd
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {participants.map((p) => (
                <li key={p.id} className="flex items-center gap-2 py-2.5">
                  <PersonName
                    id={p.id}
                    name={p.name}
                    roles={roles}
                    className="flex-1 text-sm font-medium"
                  />
                  <Input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    className="h-9 w-24"
                    placeholder={competition.unit}
                    value={entries?.[p.id] ?? ""}
                    onChange={(e) =>
                      setScore(
                        competition.id,
                        p.id,
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                  />
                  <ScoreTools
                    participantName={p.name}
                    category={competition.category}
                    unit={competition.unit}
                    currentValue={entries?.[p.id]}
                    onSave={(value) => setScore(competition.id, p.id, value)}
                  />
                  <Badge
                    variant={points[p.id] ? "default" : "secondary"}
                    className="w-12 justify-center"
                  >
                    {formatPoints(points[p.id] ?? 0)}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </AppShell>
  );
}
