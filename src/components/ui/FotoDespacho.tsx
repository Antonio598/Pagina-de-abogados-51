import Image from "next/image";
import { cn } from "@/lib/utils";

// Fotografía real del despacho, compartida por el sitio y por la landing.
//
// LA IMAGEN VENÍA ESPEJADA. La tomó una cámara frontal y el logotipo del cristal
// se leía al revés. El original está en public/fotos web/; el archivo que se
// sirve ya viene volteado, para que la marca se lea bien.
//
// Proporción fija en el contenedor + object-cover: así la foto no empuja el
// resto de la página mientras carga, y una foto 4:3 no se come la pantalla en
// escritorio.

export const foto = {
  src: "/fotos/despacho-videollamada.jpg",
  ancho: 1448,
  alto: 1086,
  alt: "Abogado de VERITUM atendiendo una asesoría por videollamada desde el despacho, con el logotipo de VERITUM grabado en el cristal.",
  pie: "Las asesorías son por videollamada, desde donde estés. El despacho está en Ciudad Satélite, Naucalpan.",
} as const;

type Props = {
  /** Texto bajo la imagen. `null` la deja sin pie. */
  pie?: string | null;
  className?: string;
  /** La primera imagen visible de la página se carga con prioridad. */
  priority?: boolean;
};

export const FotoDespacho = ({ pie = foto.pie, className, priority }: Props) => (
  <figure className={cn("overflow-hidden rounded-brand border border-gris bg-blanco shadow-card", className)}>
    <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
      <Image
        src={foto.src}
        alt={foto.alt}
        fill
        priority={priority}
        // Ancho REAL que ocupa, medido en el navegador: 766 px en Quiénes somos
        // (max-w-3xl) y 638 px en la landing (max-w-2xl). Con 640 aquí, la
        // primera pedía una imagen más pequeña que su caja y se veía blanda.
        sizes="(min-width: 1024px) 768px, 100vw"
        className="object-cover object-center"
      />
    </div>
    {pie && (
      <figcaption className="border-t border-gris px-5 py-4 text-[0.92rem] text-carbon/80">{pie}</figcaption>
    )}
  </figure>
);
