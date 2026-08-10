import { createFileRoute } from "@tanstack/react-router";
import { Eraser } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
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
        content: "Indtast resultater per deltager og se pointene blive beregnet med det samme.",
      },
      { property: "og:title", content: "Scoreindtastning – Fordelingsnøgle Kanotur" },
      {
        property: "og:description",
        content: "Indtast resultater per deltager og se pointene blive beregnet med det samme.",
      },
    ],
  }),
  component: ScoresPage,
});

function ScoresPage() {
  const { state, selectedCompetitions, activeParticipants, setScore, clearScores } = useStore();
  const [competitionId, setCompetitionId] = useState<string>("");

  useEffect(() => {
    if (selectedCompetitions.length === 0) {
      setCompetitionId("");
      return;
    }
    if (!selectedCompetitions.some((c) => c.id === competitionId)) {
      setCompetitionId(selectedCompetitions[0]!.id);
    }
  }, [selectedCompetitions, competitionId]);

  const competition = selectedCompetitions.find((c) => c.id === competitionId);
  const entries = competition ? state.scores[competition.id] : undefined;

  const points = useMemo(() => {
    if (!competition) return {};
    return competitionPoints(
      competition,
      entries,
      activeParticipants.map((p) => p.id),
    );
  }, [competition, entries, activeParticipants]);

  return (
    <AppShell
      title="Scores"
      description="Vælg en disciplin og tast resultaterne. Point beregnes automatisk efter placering."
    >
      {selectedCompetitions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Ingen konkurrencer er valgt. Gå til Konkurrencer og sæt flueben ved dem, der tæller.
        </p>
      ) : activeParticipants.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Ingen aktive deltagere. Tilføj folk under Deltagere først.
        </p>
      ) : (
        <>
          <Select value={competitionId} onValueChange={setCompetitionId}>
            <SelectTrigger>
              <SelectValue placeholder="Vælg konkurrence" />
            </SelectTrigger>
            <SelectContent>
              {selectedCompetitions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {competition ? (
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
                <div>
                  <CardTitle className="text-base">{competition.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {competition.unit} ·{" "}
                    {competition.direction === "low" ? "Lavt er bedst" : "Højt er bedst"} ·{" "}
                    {competition.multiplier}x
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => clearScores(competition.id)}>
                  <Eraser className="size-4" /> Ryd
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {activeParticipants.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 py-2.5">
                      <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                      <Input
                        type="number"
                        step="any"
                        inputMode="decimal"
                        className="h-9 w-28"
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
                      <Badge variant={points[p.id] ? "default" : "secondary"} className="w-14 justify-center">
                        {formatPoints(points[p.id] ?? 0)} p
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </AppShell>
  );
}