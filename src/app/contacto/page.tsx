import type { Metadata } from "next";
import { contact } from "@content/contact";
import { faqs } from "@content/faqs";
import { seo } from "@content/seo";
import { site } from "@content/site";
import { hasContactData, socialLinks } from "@/lib/env";
import { faqSchema } from "@/lib/schema";
import { PageHero } from "@/components/ui/PageHero";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { JsonLd } from "@/components/ui/JsonLd";
import { DrawLine, Reveal } from "@/components/motion/Reveal";
import { ContactLinks } from "@/components/layout/ContactLinks";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: seo.contacto.title,
  description: seo.contacto.description,
  alternates: { canonical: "/contacto" },
  openGraph: { title: seo.contacto.title, description: seo.contacto.description, url: "/contacto" },
};

export default async function ContactPage({ searchParams }: PageProps<"/contacto">) {
  const sp = await searchParams;
  const asunto = typeof sp.asunto === "string" ? sp.asunto : undefined;
  const recurso = typeof sp.recurso === "string" ? sp.recurso : undefined;

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <Breadcrumbs items={[{ name: "Inicio", href: "/" }, { name: "Contacto", href: "/contacto" }]} />
      <PageHero eyebrow="Contacto" title={contact.title} text={contact.text} compact />

      <Section tone="blanco" className="pt-10 md:pt-14 lg:pt-14">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <ContactForm defaultAsunto={asunto} recurso={recurso} />
          </Reveal>

          <aside className="lg:col-span-5">
            <div className="rounded-brand border border-gris bg-marfil p-7 md:p-8 lg:sticky lg:top-28">
              {hasContactData && (
                <>
                  <h2 className="eyebrow">{contact.dataTitle}</h2>
                  <DrawLine className="my-5" />
                  <ContactLinks section="contact_page" />
                </>
              )}
              {socialLinks.length > 0 && (
                <>
                  <h2 className="eyebrow mt-8">{contact.labels.redes}</h2>
                  <ul className="mt-3 flex flex-wrap gap-4">
                    {socialLinks.map((s) => (
                      <li key={s.name}>
                        <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-text">
                          {s.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <h2 className={hasContactData || socialLinks.length > 0 ? "eyebrow mt-8" : "eyebrow"}>{contact.coverageLabel}</h2>
              <DrawLine className="my-5" />
              <p className="font-display text-[1.35rem] text-azul">{site.coverage}</p>
              <p className="mt-6 text-sm text-carbon/75">{site.legalNotice}</p>
            </div>
          </aside>
        </div>
      </Section>

      <Section tone="marfil" id="preguntas-frecuentes">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <SectionHeading number="01" eyebrow="Antes de contactar" title={contact.faqTitle} className="mb-0 lg:sticky lg:top-28" />
          </div>
          <Reveal className="lg:col-span-8">
            <Accordion items={faqs} defaultOpen={0} />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
