// PROVISIONAL: reemplazar por el archivo SVG oficial del logotipo VERITUM.
// Este componente es un wordmark tipográfico neutro (VERITUM + descriptor +
// líneas laterales) para que el sitio funcione mientras se recibe el logotipo.
// No es una reinterpretación del logo oficial. Al recibir el SVG:
//   1. Guardar en /public/brand/veritum.svg (y veritum-inverse.svg para fondos azules).
//   2. Sustituir el contenido de este componente por <Image src="/brand/veritum.svg" …/>.
//   3. Reemplazar /public/icon.svg por la versión simplificada oficial.

import Link from "next/link";
import { site } from "@content/site";
import { cn } from "@/lib/utils";

type LogoProps = {
  inverse?: boolean;
  className?: string;
  asLink?: boolean;
  size?: "sm" | "md" | "lg";
};

export const Logo = ({ inverse, className, asLink = true, size = "md" }: LogoProps) => {
  const word = inverse ? "text-blanco" : "text-azul";
  const line = inverse ? "bg-dorado" : "bg-dorado";
  const desc = inverse ? "text-marfil/75" : "text-dorado-2";
  // Escala responsiva: en móvil el logo es compacto para que el header nunca desborde.
  const scale = size === "sm" ? "text-[1rem] tracking-[0.16em] md:tracking-[0.22em]" : size === "lg" ? "text-[1.6rem] tracking-[0.22em] md:text-[2rem]" : "text-[1rem] tracking-[0.16em] md:text-[1.45rem] md:tracking-[0.22em]";
  const descScale = size === "sm" ? "text-[0.5rem] tracking-[0.22em] md:tracking-[0.3em]" : size === "lg" ? "text-[0.62rem] tracking-[0.3em] md:text-[0.72rem]" : "text-[0.5rem] tracking-[0.22em] md:text-[0.56rem] md:tracking-[0.3em]";

  const mark = (
    <span className={cn("inline-flex flex-col items-center leading-none select-none", className)}>
      <span className="flex items-center gap-2 md:gap-2.5">
        <span className={cn("h-px w-3 md:w-5", line)} aria-hidden />
        <span className={cn("font-display font-medium", word, scale)}>{site.name}</span>
        <span className={cn("h-px w-3 md:w-5", line)} aria-hidden />
      </span>
      <span className={cn("mt-1.5 whitespace-nowrap font-sans font-semibold uppercase", desc, descScale)}>
        {site.descriptor}
      </span>
    </span>
  );

  if (!asLink) return mark;
  return (
    <Link href="/" title="Ir al inicio" className="inline-flex rounded-brand p-1">
      {mark}
    </Link>
  );
};
