import Image from "next/image";
import { BadgeCheck, ExternalLink } from "lucide-react";
import { equipo, equipoPendiente } from "@content/equipo";

// Quién te atiende.
//
// Mientras content/equipo.ts esté vacío se muestra un compromiso verificable en
// lugar de perfiles: no hay fotografías ni cédulas en el repositorio y no se
// inventan, que es la misma regla de content/about.ts y de /quienes-somos.
// En cuanto se añadan perfiles, esta sección los pinta sin tocar nada más.

const Pendiente = () => (
  <>
    <p className="eyebrow">{equipoPendiente.eyebrow}</p>
    <h2 className="font-display type-h2 mt-2 text-balance text-azul">{equipoPendiente.title}</h2>
    <p className="mt-4 text-[1.0625rem] text-carbon/85">{equipoPendiente.text}</p>

    <ul className="mt-6 space-y-3">
      {equipoPendiente.puntos.map((p) => (
        <li key={p} className="flex gap-3 text-[0.98rem] text-carbon/90">
          <BadgeCheck className="mt-0.5 size-5 shrink-0 text-dorado-2" strokeWidth={1.75} aria-hidden />
          <span>{p}</span>
        </li>
      ))}
    </ul>

    <a
      href={equipoPendiente.verificaHref}
      target="_blank"
      rel="noopener noreferrer"
      className="link-text mt-6 inline-flex min-h-10 items-center gap-2 text-[0.95rem]"
    >
      {equipoPendiente.verificaLabel}
      <ExternalLink className="size-4" strokeWidth={1.75} aria-hidden />
    </a>
  </>
);

const Perfiles = () => (
  <>
    <p className="eyebrow">{equipoPendiente.eyebrow}</p>
    <h2 className="font-display type-h2 mt-2 text-balance text-azul">Quién atiende tu asunto</h2>

    <ul className="mt-8 grid gap-6 sm:grid-cols-2">
      {equipo.map((m) => (
        <li key={m.slug} className="rounded-brand border border-gris bg-blanco p-5">
          <Image
            src={m.foto}
            alt={m.fotoAlt}
            width={128}
            height={128}
            className="size-24 rounded-brand object-cover"
          />
          <p className="font-display mt-4 text-[1.15rem] text-azul">{m.nombre}</p>
          <p className="text-sm text-carbon/75">{m.cargo}</p>
          <p className="mt-2 text-xs text-carbon/70">
            Cédula profesional {m.cedula} · {m.cedulaInstitucion}
          </p>
          <p className="mt-3 text-[0.95rem] text-carbon/85">{m.sintesis}</p>
          <p className="mt-3 text-xs uppercase tracking-wider text-carbon/70">{m.areas.join(" · ")}</p>
        </li>
      ))}
    </ul>
  </>
);

export const EquipoBlock = () => (equipo.length === 0 ? <Pendiente /> : <Perfiles />);
