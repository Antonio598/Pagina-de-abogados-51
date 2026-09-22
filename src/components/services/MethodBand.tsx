import { site } from "@content/site";
import { Section, Eyebrow } from "@/components/ui/Section";
import { DrawLine, Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { pad2 } from "@/lib/utils";

/** Banda del Método VERITUM: Escuchar → Entender → Diagnosticar → Diseñar → Actuar → Acompañar. */
export const MethodBand = () => (
  <Section tone="grid-azul" tight>
    <Reveal>
      <Eyebrow className="!text-dorado">Método VERITUM</Eyebrow>
    </Reveal>
    <DrawLine color="blanco" className="mt-6" />
    <Stagger as="ol" className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 md:grid-cols-3 lg:grid-cols-6">
      {site.method.map((step, i) => (
        <StaggerItem as="li" key={step} className="flex flex-col gap-2">
          <span className="font-display text-sm tabular-nums text-dorado" aria-hidden>
            {pad2(i + 1)}
          </span>
          <span className="font-display text-[1.4rem] leading-tight text-blanco md:text-[1.6rem]">{step}</span>
        </StaggerItem>
      ))}
    </Stagger>
    <DrawLine color="blanco" delay={0.2} />
    <Reveal delay={0.2}>
      <p className="mt-6 max-w-2xl text-marfil/75">{site.tagline}</p>
    </Reveal>
  </Section>
);
