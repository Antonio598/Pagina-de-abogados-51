import { home } from "@content/home";
import { site } from "@content/site";
import { Section, SectionHeading } from "@/components/ui/Section";
import { DrawLine, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { pad2 } from "@/lib/utils";

export const WhyVeritum = () => (
  <Section tone="grid-azul" id="por-que-veritum">
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <SectionHeading number="04" eyebrow={site.pillars[2]} title={home.why.title} inverse className="mb-0 lg:sticky lg:top-28" />
      </div>
      <Stagger as="ul" className="lg:col-span-8" amount={0.2}>
        {home.why.bullets.map((b, i) => (
          <StaggerItem as="li" key={b} className="group">
            <DrawLine color="blanco" delay={i * 0.08} />
            <div className="flex gap-6 py-7 md:gap-10">
              <span className="font-display text-sm tabular-nums text-dorado" aria-hidden>
                {pad2(i + 1)}
              </span>
              <p className="font-display text-[1.35rem] leading-snug text-balance text-blanco md:text-[1.6rem]">{b}</p>
            </div>
          </StaggerItem>
        ))}
        <DrawLine color="blanco" delay={0.35} />
      </Stagger>
    </div>
  </Section>
);
