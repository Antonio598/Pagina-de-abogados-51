import { Check } from "lucide-react";
import { home } from "@content/home";
import { site } from "@content/site";
import { Section, Eyebrow } from "@/components/ui/Section";
import { DrawLine, Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

export const TrustBlock = () => (
  <Section tone="blanco" className="pt-24 md:pt-32">
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <Reveal className="lg:col-span-7">
        <Eyebrow number="01">{site.pillars[0]}</Eyebrow>
        <p className="font-display mt-6 text-[1.55rem] leading-[1.3] text-balance text-azul md:text-[1.95rem]">{home.trust.text}</p>
      </Reveal>
      <div className="lg:col-span-5 lg:pt-10">
        <DrawLine className="mb-6" />
        <Stagger as="ul" className="space-y-5">
          {home.trust.bullets.map((b) => (
            <StaggerItem as="li" key={b} className="flex items-start gap-4">
              <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-dorado/50 text-dorado-2">
                <Check className="size-3.5" strokeWidth={2} aria-hidden />
              </span>
              <span className="text-carbon/90">{b}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </div>
  </Section>
);
