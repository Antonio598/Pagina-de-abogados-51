import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { home } from "@content/home";
import { resources } from "@content/library";
import { site } from "@content/site";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

export const LibraryTeaser = () => (
  <Section tone="marfil" id="biblioteca-destacada">
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <SectionHeading number="05" eyebrow={site.pillars[3]} title={home.library.title} text={home.library.text} className="mb-8" />
        <Reveal>
          <ButtonLink href={home.library.cta.href} variant="secondary" arrow>
            {home.library.cta.label}
          </ButtonLink>
        </Reveal>
      </div>
      <Stagger as="ul" className="divide-y divide-gris border-y border-gris lg:col-span-7">
        {resources.map((r) => (
          <StaggerItem as="li" key={r.slug}>
            <Link
              href={`/biblioteca/${r.slug}`}
              className="group flex items-center justify-between gap-6 py-6 transition-[padding] duration-250 ease-brand hover:pl-2"
            >
              <span>
                <span className="block text-xs uppercase tracking-widest text-dorado-2">{r.kind}</span>
                <span className="font-display mt-1 block text-[1.3rem] leading-snug text-azul md:text-[1.5rem]">{r.homeTitle}</span>
              </span>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-azul/20 text-azul transition-[background-color,color,border-color] duration-250 group-hover:border-azul group-hover:bg-azul group-hover:text-blanco">
                <ArrowUpRight className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  </Section>
);
