import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@content/services";
import { site } from "@content/site";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Página no encontrada │ VERITUM", robots: { index: false } };

// Página 404 útil: orienta hacia los servicios y el contacto.
export default function NotFound() {
  return (
    <>
      <PageHero eyebrow="Error 404" title="No encontramos esta página" text={site.tagline} compact>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" arrow>
            Ir al inicio
          </ButtonLink>
          <ButtonLink href="/contacto" variant="secondary">
            Contacto
          </ButtonLink>
        </div>
      </PageHero>
      <Section tone="blanco" tight>
        <p className="eyebrow">Servicios</p>
        <Stagger as="ul" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <StaggerItem as="li" key={s.slug}>
              <Link href={`/servicios/${s.slug}`} className="group flex items-center gap-4 rounded-brand border border-gris bg-marfil px-5 py-4 transition-[border-color,transform] duration-250 hover:-translate-y-0.5 hover:border-dorado/50">
                <span className="flex size-10 items-center justify-center rounded-brand bg-blanco text-azul group-hover:bg-azul group-hover:text-blanco">
                  <ServiceIcon name={s.icon} className="size-5" />
                </span>
                <span className="font-medium text-azul">{s.name}</span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>
    </>
  );
}
