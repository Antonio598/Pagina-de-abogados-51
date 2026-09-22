import Link from "next/link";
import { home } from "@content/home";
import { essentialFaqIds, faqsById } from "@content/faqs";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { faqSchema } from "@/lib/schema";

export const FaqEssentials = () => {
  const items = faqsById(essentialFaqIds);
  return (
    <Section tone="blanco" id="preguntas-frecuentes">
      <JsonLd data={faqSchema(items)} />
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <SectionHeading number="06" eyebrow="Antes de contactar" title={home.faqTitle} className="mb-6" />
          <Reveal>
            <Link href="/contacto#preguntas-frecuentes" className="link-text inline-block py-2 text-[0.95rem] font-medium">
              Ver todas las preguntas frecuentes
            </Link>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-8">
          <Accordion items={items} defaultOpen={0} />
        </Reveal>
      </div>
    </Section>
  );
};
