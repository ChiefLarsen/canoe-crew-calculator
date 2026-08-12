import { STRATEGY_LABELS } from "./allocation";
import { formatPoints, roleBadge, type RoleHolders } from "./scoring";
import type { Assignment, SessionParticipant } from "./types";

export function buildSummary(
  assignment: Assignment,
  participants: SessionParticipant[],
  groupName: string,
  roles: RoleHolders = {},
): string {
  const nameOf = (id: string) => {
    const base = participants.find((p) => p.id === id)?.name ?? "Ukendt";
    const badge = roleBadge(id, roles);
    return badge ? `${base} ${badge}` : base;
  };
  const lines: string[] = [];
  lines.push(`🛶 Fordelingsnøgle – ${groupName}`);
  lines.push(`Strategi: ${STRATEGY_LABELS[assignment.strategy]}`);
  lines.push("");
  assignment.canoes.forEach((canoe, index) => {
    lines.push(`Kano #${index + 1} (${canoe.size} mand)`);
    for (const seat of canoe.seats) {
      lines.push(
        `  • ${nameOf(seat.participantId)} – ${seat.role} (${seat.position}) – ${formatPoints(seat.points)} p`,
      );
    }
    lines.push("");
  });
  lines.push("Skål! 🍺");
  return lines.join("\n").trim();
}
