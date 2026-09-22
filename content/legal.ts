// Avisos legales (Bloque 6). VERITUM entrega los textos definitivos: no copiar
// avisos de otros sitios. Aquí solo se define la estructura de secciones.
// Mientras `body` esté vacío, la página muestra el índice de secciones y una
// nota neutra de publicación pendiente (bloqueante de lanzamiento, ver README).

export type LegalDoc = {
  slug: string;
  title: string;
  sections: string[];
  /** Texto por sección, en el mismo orden que `sections`. Lo entrega VERITUM. */
  body?: { heading: string; paragraphs: string[] }[];
  updatedAt?: string;
};

export const legalPending = "Este documento se publicará una vez que VERITUM apruebe su texto definitivo.";

export const legalDocs: LegalDoc[] = [
  {
    slug: "aviso-de-privacidad",
    title: "Aviso de privacidad",
    sections: [
      "Identidad y domicilio del responsable",
      "Datos personales recabados y finalidades",
      "Tratamiento de datos sensibles",
      "Medios para ejercer derechos ARCO y revocar el consentimiento",
      "Transferencias y proveedores",
      "Uso de cookies, analítica y herramientas de terceros",
      "Menores de edad y datos de terceros",
      "Conservación y eliminación de datos recibidos por formularios",
      "Datos de las reservas y del procesador de pagos (Stripe)",
      "Aviso de privacidad simplificado",
    ],
  },
  {
    slug: "terminos-de-uso",
    title: "Términos de uso",
    sections: [
      "Alcance y limitación del contenido informativo",
      "Condiciones de la asesoría inicial",
      "Pagos, facturación y comprobantes",
      "Reprogramación, cancelación y no asistencia",
      "Relación profesional y formalización del servicio",
      "Propiedad intelectual",
      "Legislación aplicable",
    ],
  },
  {
    slug: "politica-de-cookies",
    title: "Política de cookies",
    sections: [
      "Qué son las cookies y tecnologías similares",
      "Cookies esenciales",
      "Cookies de analítica",
      "Cookies de publicidad",
      "Medición propia de tráfico (sin cookies ni datos personales)",
      "Cookie de la promoción por tiempo limitado",
      "Cómo cambiar tu decisión",
      "Proveedores y etiquetas implementadas",
    ],
  },
];

export const getLegal = (slug: string) => legalDocs.find((d) => d.slug === slug);
