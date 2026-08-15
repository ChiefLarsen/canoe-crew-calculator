import { createFileRoute } from "@tanstack/react-router";
import { Copy, History, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { CanoeCards } from "@/components/CanoeCards";
import { PersonName } from "@/components/PersonName";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STRATEGY_LABELS } from "@/lib/allocation";
import { formatPoints } from "@/lib/scoring";
import { useStore } from "@/lib/store";
import { buildSummary } from "@/lib/summary";

export const Route = createFileRoute("/historik")({
  head: () => ({
    meta: [
      { title: "Historik – Fordelingsnøgle Kanotur" },
      {
        name: "description",
        content: "Arkiv over afsluttede fordelingsnøgler med vindere, kanoer og særlige roller.",
      },
      { property: "og:title", content: "Historik – Fordelingsnøgle Kanotur" },
      {
        property: "og:description",
        content: "Arkiv over afsluttede fordelingsnøgler med vindere, kanoer og særlige roller.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { state, deleteHistoryEntry } = useStore();

  return (
    <AppShell
      title="Historik"
      description="Afsluttede fordelingsnøgler. Arkiverede sessioner er låst og kan ikke redigeres."
    >
      {state.history.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Ingen afsluttede sessioner endnu.
        </p>
      ) : (
        <Card>
          <CardContent className="p-2 sm:p-4">
            <Accordion type="single" collapsible className="w-full">
              {state.history.map((entry) => {
                const roles = { leaderId: entry.leaderId, captainId: entry.captainId };
                const winner = entry.standings[0];
                return (
                  <AccordionItem key={entry.id} value={entry.id}>
                    <AccordionTrigger className="text-left">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {entry.name || entry.groupName}
                        </span>
                        <span className="block text-xs font-normal text-muted-foreground">
                          {new Date(entry.endedAt).toLocaleString("da-DK")} ·{" "}
                          {entry.participants.length} deltagere
                          {winner ? ` · 🏆 ${winner.name}` : ""}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Lock className="size-3" /> Låst arkiv
                        </Badge>
                        {entry.assignment ? (
                          <Badge variant="secondary">
                            {STRATEGY_LABELS[entry.assignment.strategy]}
                          </Badge>
                        ) : null}
                        {entry.leaderId ? (
                          <Badge variant="secondary">
                            🧭{" "}
                            {entry.participants.find((p) => p.id === entry.leaderId)?.name ?? "?"}
                          </Badge>
                        ) : null}
                        {entry.captainId ? (
                          <Badge variant="secondary">
                            🧢{" "}
                            {entry.participants.find((p) => p.id === entry.captainId)?.name ?? "?"}
                          </Badge>
                        ) : null}
                      </div>

                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Slutstilling
                        </p>
                        <ul className="divide-y divide-border rounded-lg border border-border">
                          {entry.standings.map((row, index) => (
                            <li key={row.id} className="flex items-center gap-3 px-3 py-2">
                              <span className="w-5 text-sm text-muted-foreground">
                                {index + 1}.
                              </span>
                              <PersonName
                                id={row.id}
                                name={row.name}
                                roles={roles}
                                className="flex-1 text-sm"
                              />
                              <span className="text-sm text-muted-foreground">
                                {formatPoints(row.points)} p
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {entry.assignment ? (
                        <div>
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Kanoer
                          </p>
                          <CanoeCards
                            assignment={entry.assignment}
                            participants={entry.participants}
                            roles={roles}
                          />
                        </div>
                      ) : null}

                      <div className="flex gap-2">
                        {entry.assignment ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const text = buildSummary(
                                entry.assignment!,
                                entry.participants,
                                entry.name || entry.groupName,
                                roles,
                              );
                              navigator.clipboard
                                .writeText(text)
                                .then(() => toast.success("Resumé kopieret."))
                                .catch(() => toast("Kunne ikke kopiere", { description: text }));
                            }}
                          >
                            <Copy className="size-4" /> Kopiér resumé
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHistoryEntry(entry.id)}
                        >
                          <Trash2 className="size-4 text-destructive" /> Slet arkiv
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <History className="size-3.5" /> Historik gemmes lokalt på denne enhed.
      </p>
    </AppShell>
  );
}
