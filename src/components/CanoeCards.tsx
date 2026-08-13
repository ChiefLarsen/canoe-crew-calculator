import { Anchor, Beer, Ship } from "lucide-react";
import { PersonName } from "@/components/PersonName";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPoints, type RoleHolders } from "@/lib/scoring";
import type { Assignment, Role, SessionParticipant } from "@/lib/types";

const ROLE_ICON: Record<Role, typeof Anchor> = {
  Styrmand: Anchor,
  Bartender: Beer,
  Motor: Ship,
};

export function CanoeCards({
  assignment,
  participants,
  roles,
}: {
  assignment: Assignment;
  participants: SessionParticipant[];
  roles: RoleHolders;
}) {
  // 2-mands kanoer vises først, 3-mands altid nederst.
  const ordered = assignment.canoes
    .map((canoe, index) => ({ canoe, index }))
    .sort((a, b) => a.canoe.size - b.canoe.size || a.index - b.index);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ordered.map(({ canoe, index }, position) => (
        <Card key={index} className={canoe.size === 3 ? "overflow-hidden sm:col-span-2" : "overflow-hidden"}>
          <CardHeader className="bg-primary/10 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Ship className="size-4 text-primary" />
              Kano #{position + 1}
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
                  participants.find((p) => p.id === seat.participantId)?.name ?? "Ukendt";
                return (
                  <li key={seat.participantId} className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <PersonName
                        id={seat.participantId}
                        name={name}
                        roles={roles}
                        className="text-sm font-medium"
                      />
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
  );
}
