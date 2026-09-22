import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { env } from "@/lib/env";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "./JsonLd";
import { cn } from "@/lib/utils";

type Crumb = { name: string; href: string };

export const Breadcrumbs = ({ items, inverse, className }: { items: Crumb[]; inverse?: boolean; className?: string }) => (
  <nav aria-label="Ruta de navegación" className={cn("container-editorial pt-6 text-sm", className)}>
    <JsonLd data={breadcrumbSchema(items.map((c) => ({ name: c.name, url: `${env.siteUrl}${c.href}` })))} />
    <ol className="flex flex-wrap items-center gap-1.5">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <li key={c.href} className="flex items-center gap-1.5">
            {last ? (
              <span aria-current="page" className={inverse ? "text-marfil/70" : "text-carbon/60"}>
                {c.name}
              </span>
            ) : (
              <Link href={c.href} className={cn("hover:underline underline-offset-4", inverse ? "text-marfil/85" : "text-azul")}>
                {c.name}
              </Link>
            )}
            {!last && <ChevronRight className={cn("size-3.5", inverse ? "text-marfil/40" : "text-carbon/35")} aria-hidden />}
          </li>
        );
      })}
    </ol>
  </nav>
);
