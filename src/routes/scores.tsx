import { createFileRoute } from "@tanstack/react-router";
import { Eraser } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { competitionPoints, formatPoints } from "@/lib/scoring";
import { useStore } from "@/lib/store";

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
      <Select value={competitionId} onValueChange={setCompetitionId}>
        <SelectTrigger>
          <SelectValue placeholder="Vælg konkurrence" />
        </SelectTrigger>
        <SelectContent>
          {competitions.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {competition ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
            <div className="min-w-0">
              <CardTitle className="text-base">{competition.name}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                {competition.unit} ·{" "}
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
