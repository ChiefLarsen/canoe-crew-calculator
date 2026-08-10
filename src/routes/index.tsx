import { createFileRoute } from "@tanstack/react-router";
import { Check, Pencil, Plus, Trash2, UserRound, X } from "lucide-react";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Deltagere – Fordelingsnøgle Kanotur" },
      {
        name: "description",
        content: "Opret grupper, tilføj deltagere og marker afbud før kanoturen.",
      },
      { property: "og:title", content: "Deltagere – Fordelingsnøgle Kanotur" },
      {
        property: "og:description",
        content: "Opret grupper, tilføj deltagere og marker afbud før kanoturen.",
      },
    ],
  }),
  component: ParticipantsPage,
});

function ParticipantsPage() {
  const {
    state,
    activeGroup,
    groupParticipants,
    activeParticipants,
    addGroup,
    deleteGroup,
    setActiveGroup,
    addParticipant,
    updateParticipant,
    deleteParticipant,
  } = useStore();

  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  return (
    <AppShell
      title="Deltagere"
      description="Hvem er med i kanoen? Slå folk fra ved afbud – de tælles ikke med i fordelingen."
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Gruppe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Select value={state.activeGroupId} onValueChange={setActiveGroup}>
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
              disabled={state.groups.length < 2}
              onClick={() => deleteGroup(state.activeGroupId)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!groupName.trim()) return;
              addGroup(groupName.trim());
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
        <CardHeader className="flex-row items-center justify-between gap-2 pb-3">
          <CardTitle className="text-base">
            {activeGroup?.name ?? "Deltagere"}{" "}
            <span className="text-muted-foreground">
              ({activeParticipants.length}/{groupParticipants.length} aktive)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              addParticipant(name.trim());
              setName("");
            }}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Navn på deltager"
            />
            <Button type="submit">
              <Plus className="size-4" /> Tilføj
            </Button>
          </form>

          {groupParticipants.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Ingen deltagere endnu. Tilføj den første ovenfor.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {groupParticipants.map((p) => (
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
                          if (editingName.trim()) updateParticipant(p.id, { name: editingName.trim() });
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
                      <span
                        className={
                          p.active
                            ? "flex-1 truncate text-sm font-medium"
                            : "flex-1 truncate text-sm text-muted-foreground line-through"
                        }
                      >
                        {p.name}
                      </span>
                      {!p.active ? <Badge variant="secondary">Afbud</Badge> : null}
                      <Switch
                        checked={p.active}
                        onCheckedChange={(v) => updateParticipant(p.id, { active: v })}
                        aria-label={`Aktiv: ${p.name}`}
                      />
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
    </AppShell>
  );
}