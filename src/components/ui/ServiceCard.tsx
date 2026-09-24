"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@content/services";
import { servicesLabels } from "@content/services";
import { cn, pad2 } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { ServiceIcon } from "./ServiceIcon";
import { SpotlightCard } from "@/components/landing/Efectos";

type Props = { service: Service; index: number; className?: string; large?: boolean };

/** Tarjeta de servicio: fondo blanco, borde gris cálido, ícono outline, título,
 *  frase corta y un solo enlace "Conocer servicio". Toda la tarjeta es clicable. */
export const ServiceCard = ({ service, index, className, large }: Props) => (
  <SpotlightCard className="h-full rounded-brand">
  <Link
    href={`/servicios/${service.slug}`}
    onClick={() => track("servicio_visto", { section: "card", service: service.slug, result: "iniciado" })}
    className={cn(
      "group relative flex h-full flex-col rounded-brand border border-gris bg-blanco p-7 shadow-card transition-[transform,box-shadow,border-color] duration-250 ease-brand",
      "hover:-translate-y-1 hover:border-dorado/40 hover:shadow-card-hover focus-visible:-translate-y-1",
      large ? "md:p-9" : "",
      className,
    )}
  >
    <div className="flex items-start justify-between">
      <span className="flex size-12 items-center justify-center rounded-brand bg-marfil text-azul transition-colors duration-250 group-hover:bg-azul group-hover:text-blanco">
        <ServiceIcon name={service.icon} />
      </span>
      <span className="font-display text-sm tabular-nums text-dorado-2" aria-hidden>
        {pad2(index + 1)}
      </span>
    </div>
    <h3 className={cn("font-display mt-7 text-azul", large ? "type-h2" : "type-h3")}>{service.name}</h3>
    <p className="mt-3 flex-1 text-[0.98rem] text-carbon/80 text-pretty">{service.cardText}</p>
    <span className="mt-7 inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-azul">
      <span className="underline-offset-4 group-hover:underline">{servicesLabels.cardCta}</span>
      <ArrowUpRight className="size-4 transition-transform duration-250 ease-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.75} aria-hidden />
    </span>
    <span className="absolute inset-x-7 bottom-0 h-px scale-x-0 bg-dorado transition-transform duration-300 ease-brand group-hover:scale-x-100" style={{ transformOrigin: "left" }} aria-hidden />
  </Link>
  </SpotlightCard>
);
