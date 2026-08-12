import { roleBadge, type RoleHolders } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export function PersonName({
  id,
  name,
  roles,
  className,
}: {
  id: string;
  name: string;
  roles: RoleHolders;
  className?: string;
}) {
  const badge = roleBadge(id, roles);
  const label =
    roles.captainId === id ? "Kaptajn" : roles.leaderId === id ? "Ekspeditionsleder" : undefined;
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <span className="truncate">{name}</span>
      {badge ? (
        <span title={label} aria-label={label} className="shrink-0 text-sm">
          {badge}
        </span>
      ) : null}
    </span>
  );
}
