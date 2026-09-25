"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CalendarClock, CalendarDays, LogOut, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/panel/citas", label: "Citas", icon: CalendarDays },
  { href: "/panel/metricas", label: "Métricas", icon: BarChart3 },
  { href: "/panel/disponibilidad", label: "Horarios", icon: CalendarClock },
  { href: "/panel/api", label: "API", icon: Webhook },
];

export const PanelNav = ({ usuario }: { usuario: string }) => {
  const pathname = usePathname();
  const router = useRouter();

  const salir = async () => {
    await fetch("/api/panel/logout", { method: "POST" });
    router.replace("/panel/acceso");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <nav aria-label="Panel">
        <ul className="flex items-center gap-1">
          {links.map((l) => {
            const activo = pathname.startsWith(l.href);
            const Icon = l.icon;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={activo ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-brand px-2.5 text-[0.9rem] font-medium transition-colors sm:px-3",
                    activo ? "bg-azul text-blanco" : "text-azul hover:bg-azul/5",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                  <span className="hidden sm:inline">{l.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <span className="hidden text-sm text-carbon/70 lg:inline">{usuario}</span>
      <button
        type="button"
        onClick={salir}
        className="inline-flex min-h-10 items-center gap-2 rounded-brand px-2.5 text-[0.9rem] text-azul hover:bg-azul/5"
      >
        <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
        <span className="hidden sm:inline">Salir</span>
      </button>
    </div>
  );
};
