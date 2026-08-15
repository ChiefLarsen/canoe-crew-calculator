import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { CanoeCards } from "@/components/CanoeCards";
import { NoSession } from "@/components/NoSession";
import { SessionNav } from "@/components/SessionNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STRATEGY_LABELS } from "@/lib/allocation";
import { useStore } from "@/lib/store";
import { buildSummary } from "@/lib/summary";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SummaryPage,
});

function SummaryPage() {
  const { session } = useStore();
  if (!session) return <NoSession title="Oversigt" />;

  const assignment = session.assignment;
  const roles = { leaderId: session.leaderId, captainId: session.captainId };

  const copy = async () => {
    if (!assignment) return;
    const text = buildSummary(
      assignment,
      session.participants,
      session.name || session.groupName,
      roles,
    );
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Resumé kopieret – klar til at paste ind i chatten.");
    } catch {
      toast("Kunne ikke kopiere automatisk", { description: text });
    }
  };

  return (
    <AppShell
      title="Oversigt"
      description="Hvem sidder hvor – og hvem holder styr på øllet."
      subnav={<SessionNav />}
    >
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
            <Button className="ml-auto" onClick={() => void copy()}>
              <Copy className="size-4" /> Kopiér resumé
            </Button>
          </div>
          <CanoeCards
            assignment={assignment}
            participants={session.participants}
            roles={roles}
          />
        </>
      )}
    </AppShell>
  );
}
