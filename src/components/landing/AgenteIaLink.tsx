"use client";

import { MessageCircle } from "lucide-react";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** Enlace al agente de IA. Si no hay URL configurada, no se muestra nada. */
export const AgenteIaLink = ({ href, children, className, compact }: { href?: string; children: React.ReactNode; className?: string; compact?: boolean }) => {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("agente_ia_click", { section: "landing" })}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-brand border border-azul px-4 font-medium text-azul transition-colors hover:bg-azul/5",
        compact && "px-3 text-[0.9rem]",
        className,
      )}
    >
      <MessageCircle className="size-4" strokeWidth={1.75} aria-hidden />
      {children}
    </a>
  );
};
