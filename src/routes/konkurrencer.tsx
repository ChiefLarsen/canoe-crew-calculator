import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import type { ScoringDirection } from "@/lib/types";

export const Route = createFileRoute("/konkurrencer")({
  head: () => ({
    meta: [
      { title: "Konkurrencer – Fordelingsnøgle Kanotur" },
      {
        name: "description",
        content: "Rediger ølkonkurrencer, enheder, pointretning og multiplier – eller lav dine egne.",
      },
      { property: "og:title", content: "Konkurrencer – Fordelingsnøgle Kanotur" },
      {
        property: "og:description",
        content: "Rediger ølkonkurrencer, enheder, pointretning og multiplier.",
      },
    ],
  }),
  component: CompetitionsPage,
});

const MULTIPLIERS = [0.5, 1, 1.5, 2, 3];

function CompetitionsPage() {
  const { state, addCompetition, updateCompetition, deleteCompetition } = useStore();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [direction, setDirection] = useState<ScoringDirection>("high");
  const [multiplier, setMultiplier] = useState("1");

  return (
    <AppShell
      title="Konkurrencer"
      description="Vælg hvilke discipliner der tæller med i år. Lav retningen om, hvis lavt tal er bedst."
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ny konkurrence</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              addCompetition({
                name: name.trim(),
                unit: unit.trim() || "point",
                direction,
                multiplier: Number(multiplier) || 1,
                selected: true,
              });
              setName("");
              setUnit("");
              setDirection("high");
              setMultiplier("1");
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Navn</Label>
              <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-unit">Enhed</Label>
              <Input
                id="c-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="sek, cm, dB, point"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Retning</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as ScoringDirection)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Højt er bedst</SelectItem>
                  <SelectItem value="low">Lavt er bedst</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Multiplier</Label>
              <Select value={multiplier} onValueChange={setMultiplier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MULTIPLIERS.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">
                <Plus className="size-4" /> Tilføj konkurrence
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {state.competitions.map((c) => (
          <Card key={c.id}>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={c.selected}
                  onCheckedChange={(v) => updateCompetition(c.id, { selected: v === true })}
                  aria-label={`Aktiv: ${c.name}`}
                  className="mt-2.5"
                />
                <Input
                  value={c.name}
                  onChange={(e) => updateCompetition(c.id, { name: e.target.value })}
                  className="flex-1 font-medium"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Slet ${c.name}`}
                  onClick={() => deleteCompetition(c.id)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Enhed</Label>
                  <Input
                    value={c.unit}
                    onChange={(e) => updateCompetition(c.id, { unit: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Retning</Label>
                  <Select
                    value={c.direction}
                    onValueChange={(v) =>
                      updateCompetition(c.id, { direction: v as ScoringDirection })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Højt er bedst</SelectItem>
                      <SelectItem value="low">Lavt er bedst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Multiplier</Label>
                  <Select
                    value={String(c.multiplier)}
                    onValueChange={(v) => updateCompetition(c.id, { multiplier: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MULTIPLIERS.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {m}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}