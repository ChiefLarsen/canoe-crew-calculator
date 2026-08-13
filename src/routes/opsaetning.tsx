import { createFileRoute } from "@tanstack/react-router";
import { Check, Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import type { Competition, ScoringDirection } from "@/lib/types";

export const Route = createFileRoute("/opsaetning")({
  head: () => ({
    meta: [
      { title: "Opsætning – Fordelingsnøgle Kanotur" },
      {
        name: "description",
        content: "Administrér faste grupper, deltagerlister og hele konkurrence-kataloget.",
      },
      { property: "og:title", content: "Opsætning – Fordelingsnøgle Kanotur" },
      {
        property: "og:description",
        content: "Administrér faste grupper, deltagerlister og hele konkurrence-kataloget.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SetupPage,
});

function SetupPage() {
  return (
    <AppShell
      title="Opsætning"
      description="Dine faste grupper og dit konkurrence-katalog. Sessioner bygges ovenpå det her."
    >
      <Tabs defaultValue="people">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="people">Deltagere &amp; grupper</TabsTrigger>
          <TabsTrigger value="competitions">Konkurrence-katalog</TabsTrigger>
        </TabsList>
        <TabsContent value="people" className="space-y-6 pt-6">
          <PeopleTab />
        </TabsContent>
        <TabsContent value="competitions" className="space-y-6 pt-6">
          <CompetitionsTab />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function PeopleTab() {
  const {
    state,
    addGroup,
    renameGroup,
    deleteGroup,
    participantsOf,
    addParticipant,
    updateParticipant,
    deleteParticipant,
  } = useStore();

  const [groupId, setGroupId] = useState(state.groups[0]?.id ?? "");
  const [groupName, setGroupName] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const current = state.groups.find((g) => g.id === groupId) ?? state.groups[0];
  const people = current ? participantsOf(current.id) : [];

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Grupper</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Select value={current?.id ?? ""} onValueChange={setGroupId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Vælg gruppe" />
              </SelectTrigger>
              <SelectContent>
                {state.groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              aria-label="Slet gruppe"
              disabled={state.groups.length < 2 || !current}
              onClick={() => {
                if (!current) return;
                deleteGroup(current.id);
                const next = state.groups.find((g) => g.id !== current.id);
                setGroupId(next?.id ?? "");
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          {current ? (
            <div className="flex gap-2">
              <Input
                value={current.name}
                onChange={(e) => renameGroup(current.id, e.target.value)}
                aria-label="Gruppenavn"
              />
            </div>
          ) : null}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!groupName.trim()) return;
              setGroupId(addGroup(groupName.trim()));
              setGroupName("");
            }}
          >
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ny gruppe, fx Kanotur 2027"
            />
            <Button type="submit" variant="secondary">
              <Plus className="size-4" /> Opret
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Deltagere{" "}
            <span className="text-muted-foreground">({people.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || !current) return;
              addParticipant(current.id, name.trim());
              setName("");
            }}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Navn på deltager"
            />
            <Button type="submit" disabled={!current}>
              <Plus className="size-4" /> Tilføj
            </Button>
          </form>

          {people.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Ingen deltagere endnu. Tilføj den første ovenfor.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {people.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                  {editingId === p.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-9 flex-1"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Gem navn"
                        onClick={() => {
                          if (editingName.trim())
                            updateParticipant(p.id, { name: editingName.trim() });
                          setEditingId(null);
                        }}
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Annuller"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="size-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <UserRound className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate text-sm font-medium">{p.name}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Rediger ${p.name}`}
                        onClick={() => {
                          setEditingId(p.id);
                          setEditingName(p.name);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Slet ${p.name}`}
                        onClick={() => deleteParticipant(p.id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}

const EMPTY: Omit<Competition, "id"> = {
  name: "",
  unit: "",
  description: "",
  direction: "high",
  multiplier: 1,
};

function CompetitionsTab() {
  const { state, addCompetition, updateCompetition, deleteCompetition } = useStore();
  const [draft, setDraft] = useState<Omit<Competition, "id">>(EMPTY);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Katalog <span className="text-muted-foreground">({state.competitions.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {state.competitions.map((c) => (
              <AccordionItem key={c.id} value={c.id}>
                <AccordionTrigger className="text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{c.name}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {c.unit} · {c.direction === "low" ? "Lavt er bedst" : "Højt er bedst"} ·{" "}
                      {c.multiplier}x
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor={`n-${c.id}`}>Navn</Label>
                      <Input
                        id={`n-${c.id}`}
                        value={c.name}
                        onChange={(e) => updateCompetition(c.id, { name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`u-${c.id}`}>Enhed</Label>
                      <Input
                        id={`u-${c.id}`}
                        value={c.unit}
                        onChange={(e) => updateCompetition(c.id, { unit: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Retning</Label>
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
                    <div className="space-y-1">
                      <Label htmlFor={`m-${c.id}`}>Multiplier</Label>
                      <Input
                        id={`m-${c.id}`}
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={c.multiplier}
                        onChange={(e) =>
                          updateCompetition(c.id, { multiplier: Number(e.target.value) || 1 })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`d-${c.id}`}>Beskrivelse</Label>
                    <Textarea
                      id={`d-${c.id}`}
                      value={c.description}
                      rows={3}
                      onChange={(e) => updateCompetition(c.id, { description: e.target.value })}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => deleteCompetition(c.id)}>
                    <Trash2 className="size-4 text-destructive" /> Slet konkurrence
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ny konkurrence</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.name.trim()) return;
              addCompetition({ ...draft, name: draft.name.trim() });
              setDraft(EMPTY);
            }}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Navn"
              />
              <Input
                value={draft.unit}
                onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                placeholder="Enhed, fx sekunder"
              />
              <Select
                value={draft.direction}
                onValueChange={(v) => setDraft({ ...draft, direction: v as ScoringDirection })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Højt er bedst</SelectItem>
                  <SelectItem value="low">Lavt er bedst</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                value={draft.multiplier}
                onChange={(e) => setDraft({ ...draft, multiplier: Number(e.target.value) || 1 })}
                placeholder="Multiplier"
              />
            </div>
            <Textarea
              value={draft.description}
              rows={2}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Beskrivelse / regler"
            />
            <Button type="submit" className="w-full">
              <Plus className="size-4" /> Tilføj til katalog
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
