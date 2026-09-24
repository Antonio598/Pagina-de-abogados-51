import { DrawLine, Reveal } from "@/components/motion/Reveal";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  text?: string;
  cta: { label: string; href: string };
  tone?: "marfil" | "azul";
  section?: string;
  className?: string;
};

/** Cierre de página con un solo llamado a la acción. */
export const ClosingCta = ({ title, text, cta, tone = "marfil", section = "closing", className }: Props) => {
  const inverse = tone === "azul";
  return (
    <section className={cn(inverse ? "bg-grid-azul text-marfil" : "bg-marfil text-carbon", "py-24 md:py-32", className)}>
      <div className="container-editorial">
        <DrawLine color={inverse ? "blanco" : "gold"} />
        <Reveal className="mx-auto max-w-3xl pt-14 text-center md:pt-20">
          <h2 className={cn("font-display type-h1 text-balance", inverse ? "text-blanco" : "text-azul")}>{title}</h2>
          {text && <p className={cn("mx-auto mt-6 max-w-2xl text-pretty", inverse ? "text-marfil/80" : "text-carbon/80")}>{text}</p>}
          <div className="mt-10">
            <TrackedLink href={cta.href} size="lg" arrow variant={inverse ? "inverse" : "primary"} event="cta_agenda" payload={{ section, element_id: `${section}_agenda` }} className="cta-destello">
              {cta.label}
            </TrackedLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
