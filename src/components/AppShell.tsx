import { Link } from "@tanstack/react-router";
import { History, Moon, Settings2, Ship, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useThemeToggle } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Session", icon: Ship },
  { to: "/opsaetning", label: "Opsætning", icon: Settings2 },
  { to: "/historik", label: "Historik", icon: History },
] as const;

export function AppShell({
  title,
  description,
  subnav,
  children,
}: {
  title: string;
  description?: string;
  subnav?: ReactNode;
  children: ReactNode;
}) {
  const { dark, toggle } = useThemeToggle();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Ship className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Fordelingsnøgle
            </p>
            <p className="truncate font-display text-lg font-semibold leading-tight text-foreground">
              Kanotur Edition
            </p>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label="Skift mellem lyst og mørkt tema"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
        <nav className="mx-auto max-w-3xl overflow-x-auto px-4 pb-3">
          <ul className="flex gap-2">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{
                    className: cn("bg-primary text-primary-foreground border-primary"),
                  }}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        {subnav ? <div className="mt-4">{subnav}</div> : null}
        <div className="mt-6 space-y-6">{children}</div>
      </main>
    </div>
  );
}
