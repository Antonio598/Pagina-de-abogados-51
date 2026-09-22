import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` }) as React.CSSProperties;

type Props = {
  eyebrow?: string;
  title: string;
  text?: string;
  tone?: "marfil" | "azul";
  children?: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
};

/** Encabezado de página interior: eyebrow, H1 serif y texto de introducción. Entrada con CSS. */
export const PageHero = ({ eyebrow, title, text, tone = "marfil", children, aside, compact }: Props) => {
  const inverse = tone === "azul";
  return (
    <section className={cn("relative overflow-hidden", inverse ? "bg-grid-azul text-marfil" : "bg-marfil text-carbon")}>
      {!inverse && <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid-marfil [mask-image:radial-gradient(60%_60%_at_80%_0%,black,transparent)]" />}
      <div className={cn("container-editorial relative grid gap-10 lg:grid-cols-12", compact ? "py-12 md:py-20" : "pb-14 pt-12 md:pb-24 md:pt-20 lg:pt-24")}>
        <div className={cn(aside ? "lg:col-span-7" : "lg:col-span-9")}>
          {eyebrow && (
            <p className={cn("eyebrow anim-rise flex items-center gap-3", inverse && "!text-dorado")} style={d(0)}>
              <span className="h-px w-8 bg-dorado" aria-hidden />
              {eyebrow}
            </p>
          )}
          <h1 className={cn("font-display type-h1 anim-rise-lcp mt-6 max-w-[18ch] text-balance", inverse ? "text-blanco" : "text-azul")} style={d(80)}>
            {title}
          </h1>
          {text && (
            <p className={cn("measure anim-rise-lcp mt-6 text-pretty text-[1.05rem] md:mt-7 md:text-[1.15rem]", inverse ? "text-marfil/85" : "text-carbon/85")} style={d(160)}>
              {text}
            </p>
          )}
          {children && (
            <div className="anim-rise mt-8 md:mt-9" style={d(240)}>
              {children}
            </div>
          )}
        </div>
        {aside && (
          <div className="anim-rise lg:col-span-5 lg:self-end" style={d(200)}>
            {aside}
          </div>
        )}
      </div>
    </section>
  );
};
