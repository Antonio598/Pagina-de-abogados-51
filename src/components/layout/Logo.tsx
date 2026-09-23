// Logotipo oficial de VERITUM.
//
// Se usa el archivo entregado por la firma tal cual: no se redibuja, no se
// recolorea, no se deforma y no se le añade el tagline. Los tamaños derivados
// se generan con `node scripts/generate-brand-assets.mjs` a partir de
// public/brand/veritum-logo-master.png.
//
// Sobre fondo azul el logotipo va dentro de una superficie clara (variante
// `inverse`), porque su versión monocromática invertida todavía no existe.

import Image from "next/image";
import Link from "next/link";
import { site } from "@content/site";
import { cn } from "@/lib/utils";

// Proporción del archivo original, ya recortado: 1814 × 399.
const RATIO = 1814 / 399;

const ALTURAS = { sm: 26, md: 34, lg: 44 } as const;

type LogoProps = {
  /** Sobre fondos oscuros: coloca el logotipo en una superficie clara. */
  inverse?: boolean;
  className?: string;
  asLink?: boolean;
  size?: keyof typeof ALTURAS;
  priority?: boolean;
};

export const Logo = ({ inverse, className, asLink = true, size = "md", priority }: LogoProps) => {
  const alto = ALTURAS[size];
  const ancho = Math.round(alto * RATIO);

  const marca = (
    <span
      className={cn(
        "inline-flex select-none items-center",
        // Área de protección: el logotipo siempre respira.
        inverse ? "rounded-brand bg-marfil px-4 py-3" : "py-1",
        className,
      )}
    >
      {/* `unoptimized`: los tamaños ya vienen generados por el script de marca,
          así que no hace falta el optimizador en tiempo de ejecución. */}
      <Image
        src={alto >= 40 ? "/brand/veritum-logo-880.png" : "/brand/veritum-logo-440.png"}
        alt={`${site.name} · ${site.descriptor}`}
        width={ancho}
        height={alto}
        priority={priority}
        unoptimized
        className="w-auto"
        style={{ height: `${alto}px` }}
      />
    </span>
  );

  if (!asLink) return marca;
  return (
    <Link href="/" title="Ir al inicio" className="inline-flex rounded-brand">
      {marca}
    </Link>
  );
};
