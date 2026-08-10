import { STRATEGY_LABELS } from "./allocation";
import { formatPoints } from "./scoring";
import type { Assignment, Participant } from "./types";

export function buildSummary(
  assignment: Assignment,
  participants: Participant[],
  groupName: string,
): string {
  const nameOf = (id: string) => participants.find((p) => p.id === id)?.name ?? "Ukendt";
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