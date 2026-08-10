import { createFileRoute, Link } from "@tanstack/react-router";
import { Anchor, Beer, Copy, Ship } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STRATEGY_LABELS } from "@/lib/allocation";
import { formatPoints } from "@/lib/scoring";
import { useStore } from "@/lib/store";
import { buildSummary } from "@/lib/summary";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/oversigt")({
  head: () => ({
    meta: [
      { title: "Kanooversigt – Fordelingsnøgle Kanotur" },
      {
        name: "description",
        content: "Kanokort med Styrmand, Bartender og Motor – klar til at dele i gruppechatten.",
      },
      { property: "og:title", content: "Kanooversigt – Fordelingsnøgle Kanotur" },
      {
        property: "og:description",
        content: "Kanokort med Styrmand, Bartender og Motor – klar til at dele i gruppechatten.",
      },
    ],
  }),
  component: SummaryPage,
});

const ROLE_ICON: Record<Role, typeof Anchor> = {
  Styrmand: Anchor,
  Bartender: Beer,
  Motor: Ship,
};

function SummaryPage() {
  const { state, activeGroup } = useStore();
  const assignment = state.assignment;

  const copy = async () => {
    if (!assignment) return;
    const text = buildSummary(assignment, state.participants, activeGroup?.name ?? "Kanotur");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Resumé kopieret – klar til at paste ind i chatten.");
    } catch {
      toast("Kunne ikke kopiere automatisk", { description: text });
    }
  };

  return (
    <AppShell title="Oversigt" description="Hvem sidder hvor – og hvem holder styr på øllet.">
      {!assignment ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">Der er ikke fordelt kanoer endnu.</p>
          <Button asChild className="mt-4">
            <Link to="/kanoer">Fordel kanoerne</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{STRATEGY_LABELS[assignment.strategy]}</Badge>
            <Badge variant="outline">{assignment.canoes.length} kanoer</Badge>
            <Button className="ml-auto" onClick={copy}>
              <Copy className="size-4" /> Kopiér resumé
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {assignment.canoes.map((canoe, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-primary/10 py-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Ship className="size-4 text-primary" />
                    Kano #{index + 1}
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                      {canoe.size} mand
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    {canoe.seats.map((seat) => {
                      const Icon = ROLE_ICON[seat.role];
                      const name =
                        state.participants.find((p) => p.id === seat.participantId)?.name ??
                        "Ukendt";
                      return (
                        <li key={seat.participantId} className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{name}</span>
                            <span className="block text-xs text-muted-foreground">
                              {seat.role} · {seat.position}
                            </span>
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatPoints(seat.points)} p
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}