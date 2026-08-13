import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export function NoSession({ title }: { title: string }) {
  return (
    <AppShell title={title} description="Der er ingen aktiv session lige nu.">
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Start en ny fordelingsnøgle for at bruge denne side.
        </p>
        <Button asChild className="mt-4">
          <Link to="/">Til forsiden</Link>
        </Button>
      </div>
    </AppShell>
  );
}
