import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Compass, Flag, Play, Trophy, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PersonName } from "@/components/PersonName";
import { SessionNav } from "@/components/SessionNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { computeStandings, formatPoints } from "@/lib/scoring";
import { useStore } from "@/lib/store";
import { categoryLabel } from "@/lib/units";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aktiv session – Fordelingsnøgle Kanotur" },
      {
        name: "description",
        content:
          "Start en ny fordelingsnøgle: vælg gruppe, konkurrencer og udpeg Ekspeditionsleder og Kaptajn.",
      },
      { property: "og:title", content: "Aktiv session – Fordelingsnøgle Kanotur" },
      {
        property: "og:description",
        content:
          "Start en ny fordelingsnøgle: vælg gruppe, konkurrencer og udpeg Ekspeditionsleder og Kaptajn.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { state, session } = useStore();
  const [wizard, setWizard] = useState<{ name: string; groupId: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tripName, setTripName] = useState("");
  const [groupId, setGroupId] = useState(state.groups[0]?.id ?? "");

  if (session) return <ActiveSession />;

  if (wizard)
    return (
      <Wizard
        sessionName={wizard.name}
        initialGroupId={wizard.groupId}
        onCancel={() => setWizard(null)}
      />
    );

  return (
    <AppShell
      title="Fordelingsnøglemesterens fordelingsnøgle"
      description="Ingen aktiv session. Start en ny fordelingsnøgle når selskabet er samlet."
    >
      <Card className="text-center">
        <CardContent className="space-y-4 py-10">
          <p className="text-sm text-muted-foreground">
            {state.groups.length} gruppe(r) · {state.competitions.length} konkurrencer i kataloget ·{" "}
            {state.history.length} i historikken
          </p>
          <Button size="lg" onClick={() => setDialogOpen(true)}>
            <Play className="size-4" /> Start ny fordelingsnøgle
          </Button>
          <p className="text-xs text-muted-foreground">
            Mangler du deltagere eller discipliner?{" "}
            <Link to="/opsaetning" className="underline">
              Gå til opsætning
            </Link>
          </p>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Navngiv turen</DialogTitle>
            <DialogDescription>
              Giv turen et navn og vælg hvilken gruppe deltagerne kommer fra.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="trip-name">Turens navn</Label>
              <Input
                id="trip-name"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="fx Gudenåen 2026"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label>Gruppe</Label>
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger>
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
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              disabled={!tripName.trim() || !groupId}
              onClick={() => {
                setDialogOpen(false);
                setWizard({ name: tripName.trim(), groupId });
              }}
            >
              Videre <ArrowRight className="size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Wizard({
  sessionName,
  initialGroupId,
  onCancel,
}: {
  sessionName: string;
  initialGroupId: string;
  onCancel: () => void;
}) {
  const { state, participantsOf, startSession } = useStore();
  const [step, setStep] = useState(0);
  const [groupId, setGroupId] = useState(initialGroupId || (state.groups[0]?.id ?? ""));
  const [inactive, setInactive] = useState<string[]>([]);
  
  // ÆNDRING 1: Tom liste som standard i stedet for alle
  const [competitionIds, setCompetitionIds] = useState<string[]>([]);
  
  const [leaderId, setLeaderId] = useState<string>("none");
  const [captainId, setCaptainId] = useState<string>("none");

  const people = participantsOf(groupId);
  const active = people.filter((p) => !inactive.includes(p.id));

  // ÆNDRING 2: Hjælpefunktion til Vælg Alle / Fravælg Alle
  const isAllCompetitionsSelected =
    state.competitions.length > 0 && competitionIds.length === state.competitions.length;

  const toggleSelectAllCompetitions = () => {
    if (isAllCompetitionsSelected) {
      setCompetitionIds([]);
    } else {
      setCompetitionIds(state.competitions.map((c) => c.id));
    }
  };

  const start = () => {
    startSession({
      name: sessionName,
      groupId,
      participantIds: active.map((p) => p.id),
      competitionIds,
      leaderId: leaderId === "none" ? null : leaderId,
      captainId: captainId === "none" ? null : captainId,
    });
    toast.success("Session startet – god fornøjelse!");
  };

  return (
    <AppShell title={sessionName} description={`Ny fordelingsnøgle · trin ${step + 1} af 3`}>
      {step === 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="size-4" /> Vælg gruppe og deltagere
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={groupId}
              onValueChange={(v) => {
                setGroupId(v);
                setInactive([]);
              }}
            >
              <SelectTrigger>
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

            {people.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Ingen deltagere i gruppen. Tilføj dem under Opsætning.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-lg border border-border">
                {people.map((p) => {
                  const isActive = !inactive.includes(p.id);
                  return (
                    <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                      <span
                        className={
                          isActive
                            ? "flex-1 truncate text-sm font-medium"
                            : "flex-1 truncate text-sm text-muted-foreground line-through"
                        }
                      >
                        {p.name}
                      </span>
                      {!isActive ? <Badge variant="secondary">Afbud</Badge> : null}
                      <Switch
                        checked={isActive}
                        aria-label={`Med på turen: ${p.name}`}
                        onCheckedChange={(v) =>
                          setInactive((prev) =>
                            v ? prev.filter((x) => x !== p.id) : [...prev, p.id],
                          )
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="size-4" /> Konkurrencer
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleSelectAllCompetitions}
              className="h-8 text-xs"
            >
              {isAllCompetitionsSelected ? "Fravælg alle" : "Vælg alle"}
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {state.competitions.map((c) => (
                <li key={c.id} className="flex items-start gap-3 px-3 py-2.5">
                  <Checkbox
                    id={`c-${c.id}`}
                    checked={competitionIds.includes(c.id)}
                    onCheckedChange={(v) =>
                      setCompetitionIds((prev) =>
                        v ? [...prev, c.id] : prev.filter((x) => x !== c.id),
                      )
                    }
                  />
                  <label htmlFor={`c-${c.id}`} className="min-w-0 flex-1 cursor-pointer">
                    <span className="block text-sm font-medium">{c.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {categoryLabel(c.category)} ({c.unit}) ·{" "}
                      {c.direction === "low" ? "Lavt er bedst" : "Højt er bedst"} · {c.multiplier}x
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Compass className="size-4" /> Særlige roller (valgfrit)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">🧭 Ekspeditionsleder</p>
              <p className="text-xs text-muted-foreground">
                Score ganges med 3 (eller divideres med 3, hvis lavt er bedst).
              </p>
              <Select value={leaderId} onValueChange={setLeaderId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen</SelectItem>
                  {active.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">🧢 Kaptajn</p>
              <p className="text-xs text-muted-foreground">
                Score ganges med 10 (eller divideres med 10, hvis lavt er bedst).
              </p>
              <Select value={captainId} onValueChange={setCaptainId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ingen</SelectItem>
                  {active.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => (step === 0 ? onCancel() : setStep((s) => s - 1))}
          className="flex-1"
        >
          <ArrowLeft className="size-4" /> {step === 0 ? "Annuller" : "Tilbage"}
        </Button>
        {step < 2 ? (
          <Button
            className="flex-1"
            disabled={step === 0 ? active.length < 2 : competitionIds.length === 0}
            onClick={() => setStep((s) => s + 1)}
          >
            Videre <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button className="flex-1" onClick={start}>
            <Play className="size-4" /> Start session
          </Button>
        )}
      </div>
    </AppShell>
  );
}

function ActiveSession() {
  const { session, endSession, discardSession } = useStore();
  const navigate = useNavigate();
  const s = session!;
  const roles = { leaderId: s.leaderId, captainId: s.captainId };

  const standings = useMemo(
    () => computeStandings(s.participants, s.competitions, s.scores, roles),
    [s, roles],
  );

  return (
    <AppShell
      title={s.name || s.groupName}
      description={`Aktiv session startet ${new Date(s.createdAt).toLocaleString("da-DK")}`}
      subnav={<SessionNav />}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Overblik</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{s.participants.length} deltagere</Badge>
            <Badge variant="secondary">{s.competitions.length} konkurrencer</Badge>
            <Badge variant="outline">
              {s.assignment ? `${s.assignment.canoes.length} kanoer fordelt` : "Ingen kanoer endnu"}
            </Badge>
          </div>
          <ul className="space-y-1.5">
            {standings.slice(0, 3).map((row, i) => (
              <li key={row.id} className="flex items-center gap-2 text-sm">
                <span className="w-5 text-muted-foreground">{i + 1}.</span>
                <PersonName id={row.id} name={row.name} roles={roles} className="flex-1" />
                <span className="text-muted-foreground">{formatPoints(row.points)} p</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Flag className="size-4" /> Afslut session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Sessionen gemmes i historikken som et låst arkiv, og arbejdsbordet ryddes.
          </p>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                endSession();
                toast.success("Session gemt i historikken.");
                void navigate({ to: "/historik" });
              }}
            >
              Afslut session
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                discardSession();
                toast("Session kasseret.");
              }}
            >
              Kassér
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}