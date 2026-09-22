"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { home } from "@content/home";
import { services } from "@content/services";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { track } from "@/lib/analytics";

/** Selector "¿En qué podemos ayudarte?": cuatro opciones que llevan directo a su servicio. */
export const HelpSelector = () => (
  <section aria-labelledby="selector-title" className="relative z-10 -mt-6 bg-transparent lg:-mt-10">
    <div className="container-editorial">
      <div className="rounded-brand border border-gris bg-blanco p-6 shadow-card md:p-8">
        <h2 id="selector-title" className="font-display type-h3 text-azul">
          {home.selector.title}
        </h2>
        <Stagger as="ul" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <StaggerItem as="li" key={s.slug}>
              <Link
                href={`/servicios/${s.slug}`}
                onClick={() => track("servicio_visto", { section: "selector", service: s.slug, result: "iniciado" })}
                className="group flex items-center gap-4 rounded-brand border border-gris bg-marfil px-5 py-4 transition-[background-color,border-color,transform] duration-250 ease-brand hover:-translate-y-0.5 hover:border-dorado/50 hover:bg-blanco"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-brand bg-blanco text-azul transition-colors duration-250 group-hover:bg-azul group-hover:text-blanco">
                  <ServiceIcon name={s.icon} className="size-6" />
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="text-lg font-medium text-azul">{s.short}</span>
                  <span className="text-xs uppercase tracking-widest text-dorado-2">{s.name}</span>
                </span>
                <ArrowRight className="size-5 text-azul/40 transition-[transform,color] duration-250 ease-brand group-hover:translate-x-1 group-hover:text-azul" strokeWidth={1.75} aria-hidden />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  </section>
);
