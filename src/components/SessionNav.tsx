import { Link } from "@tanstack/react-router";
import { Beer, ClipboardList, Home, ListOrdered, Ship } from "lucide-react";

const ITEMS = [
  { to: "/", label: "Session", icon: Home, exact: true },
  { to: "/scores", label: "Scores", icon: ClipboardList, exact: false },
  { to: "/stilling", label: "Stilling", icon: ListOrdered, exact: false },
  { to: "/kanoer", label: "Kanoer", icon: Ship, exact: false },
  { to: "/oversigt", label: "Oversigt", icon: Beer, exact: false },
] as const;

export function SessionNav() {
  return (
    <nav className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1.5">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
