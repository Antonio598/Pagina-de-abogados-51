import Image from "next/image";
import { cn } from "@/lib/utils";

// Fotografías reales del despacho, compartidas por el sitio y por la landing.
//
// LA DE LA VIDEOLLAMADA VENÍA ESPEJADA. La tomó una cámara frontal y el
// logotipo del cristal se leía al revés. El archivo que se sirve ya viene
// volteado, para que la marca se lea bien. Los originales están en
// public/fotos web/.
//
// SOBRE LA DE LA CONSULTA: sale una persona identificable además del abogado.
// El despacho confirmó que cuenta con su consentimiento. Si eso cambiara, basta
// con quitarla de /proceso.
//
// Proporción fija en el contenedor + object-cover: así la foto no empuja el
// resto de la página mientras carga, y una foto 4:3 no se come la pantalla en
// escritorio.

export const fotos = {
  videollamada: {
    src: "/fotos/despacho-videollamada.jpg",
    alt: "Abogado de VERITUM atendiendo una asesoría por videollamada desde el despacho, con el logotipo de VERITUM grabado en el cristal.",
    pie: "Las asesorías son por videollamada, desde donde estés. El despacho está en Ciudad Satélite, Naucalpan.",
  },
  consulta: {
    src: "/fotos/consulta-oficina.jpg",
    // El pie NO promete atención presencial: el servicio que se vende es por
    // videollamada y la foto no debe sugerir otra cosa.
    alt: "Dos personas revisando documentación de un asunto laboral sobre la mesa de juntas del despacho.",
    pie: "Revisamos tu documentación antes de la sesión y te decimos qué encontramos.",
  },
} as const;

export type FotoId = keyof typeof fotos;

type Props = {
  /** Cuál de las fotografías se muestra. */
  foto?: FotoId;
  /** Texto bajo la imagen. `null` la deja sin pie. */
  pie?: string | null;
  className?: string;
  /** La primera imagen visible de la página se carga con prioridad. */
  priority?: boolean;
  /**
   * Ancho que ocupa la imagen en escritorio, MEDIDO en el navegador. Sin esto
   * se pide siempre la versión de la columna más ancha: en /proceso la caja son
   * 454 px y se estaba descargando la de 828.
   */
  anchoEscritorio?: string;
};

export const FotoDespacho = ({
  foto = "videollamada",
  pie,
  className,
  priority,
  anchoEscritorio = "768px",
}: Props) => {
  const f = fotos[foto];
  const leyenda = pie === undefined ? f.pie : pie;

  return (
    <figure className={cn("overflow-hidden rounded-brand border border-gris bg-blanco shadow-card", className)}>
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
        <Image
          src={f.src}
          alt={f.alt}
          fill
          priority={priority}
          // Medido en el navegador: 766 px en Quiénes somos (max-w-3xl), 638
          // en la landing (max-w-2xl) y 454 en /proceso (una columna de cinco
          // doceavos). Con un valor fijo de 640, la primera pedía una imagen
          // más pequeña que su caja y se veía blanda.
          sizes={`(min-width: 1024px) ${anchoEscritorio}, 100vw`}
          className="object-cover object-center"
        />
      </div>
      {leyenda && (
        <figcaption className="border-t border-gris px-5 py-4 text-[0.92rem] text-carbon/80">{leyenda}</figcaption>
      )}
    </figure>
  );
};
