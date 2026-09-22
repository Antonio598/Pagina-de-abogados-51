import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/Reveal";

type Tone = "marfil" | "blanco" | "azul" | "grid-azul" | "grid-marfil";

const tones: Record<Tone, string> = {
  marfil: "bg-marfil text-carbon",
  blanco: "bg-blanco text-carbon",
  azul: "bg-azul text-marfil",
  "grid-azul": "bg-grid-azul text-marfil",
  "grid-marfil": "bg-grid-marfil text-carbon",
};

type SectionProps = ComponentPropsWithoutRef<"section"> & { tone?: Tone; tight?: boolean };

export const Section = ({ tone = "marfil", tight, className, children, ...rest }: SectionProps) => (
  <section className={cn(tones[tone], tight ? "py-14 md:py-20" : "py-20 md:py-28 lg:py-32", className)} {...rest}>
    <div className="container-editorial">{children}</div>
  </section>
);

export const Eyebrow = ({ children, className, number }: { children: ReactNode; className?: string; number?: string }) => (
  <p className={cn("eyebrow flex items-center gap-3", className)}>
    {number && (
      <span className="tabular-nums" aria-hidden>
        {number}
      </span>
    )}
    {number && <span className="h-px w-8 bg-dorado/60" aria-hidden />}
    <span>{children}</span>
  </p>
);

type HeadingProps = {
  eyebrow?: string;
  number?: string;
  title: string;
  text?: string;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  inverse?: boolean;
  className?: string;
  children?: ReactNode;
};

export const SectionHeading = ({ eyebrow, number, title, text, as = "h2", align = "left", inverse, className, children }: HeadingProps) => {
  const Tag = as;
  return (
    <Reveal className={cn("mb-12 md:mb-16", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <Eyebrow number={number} className={cn(align === "center" && "justify-center", inverse && "text-dorado")}>
          {eyebrow}
        </Eyebrow>
      )}
      <Tag
        className={cn(
          "font-display mt-4 text-balance",
          as === "h1" ? "type-h1" : as === "h2" ? "type-h2" : "type-h3",
          inverse ? "text-blanco" : "text-azul",
          align === "center" ? "mx-auto max-w-3xl" : "max-w-3xl",
        )}
      >
        {title}
      </Tag>
      {text && (
        <p className={cn("measure mt-5 text-pretty", inverse ? "text-marfil/80" : "text-carbon/80", align === "center" && "mx-auto")}>
          {text}
        </p>
      )}
      {children}
    </Reveal>
  );
};

export const GoldRule = ({ className }: { className?: string }) => <div className={cn("gold-rule w-full", className)} aria-hidden />;
