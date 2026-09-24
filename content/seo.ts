// Títulos y meta descripciones — tabla del Bloque 7. Las páginas sin fila en la
// tabla usan el patrón "Página │ VERITUM" con una descripción breve derivada del contenido.

export type PageSeo = { title: string; description: string };

export const seo: Record<string, PageSeo> = {
  home: {
    title: "VERITUM │ Asesoría legal en línea en todo México",
    description:
      "Asesoría legal por videollamada para personas, trabajadores y empresas de todo México. Estrategia clara y acompañamiento humano. Agenda tu sesión.",
  },
  servicios: {
    title: "Servicios legales │ VERITUM",
    description:
      "Conoce las áreas de atención de VERITUM: familia, laboral, empresas, derecho civil y contratos.",
  },
  quienesSomos: {
    title: "Quiénes somos │ VERITUM",
    description:
      "Conoce el enfoque, misión, visión y valores de VERITUM, una firma legal centrada en claridad, estrategia y acompañamiento humano.",
  },
  biblioteca: {
    title: "Biblioteca legal │ VERITUM",
    description:
      "Guías y herramientas prácticas para comprender temas familiares, laborales, contractuales y preventivos.",
  },
  contacto: {
    title: "Contacto y asesoría │ VERITUM",
    description:
      "Contacta a VERITUM y comparte brevemente tu situación para conocer el siguiente paso. Asesoría en línea en todo México.",
  },
  proceso: {
    title: "Proceso │ VERITUM",
    description: "Qué ocurre desde el primer contacto: contacto inicial, agenda, asesoría, diagnóstico, propuesta y seguimiento.",
  },
  preventiva: {
    title: "Estrategia legal preventiva │ VERITUM",
    description: "Prevenir también es una forma de proteger: revisión oportuna de acuerdos, documentos y obligaciones para personas y empresas.",
  },
  agenda: {
    title: "Agenda asesoría │ VERITUM",
    description: "Agenda tu asesoría legal en línea con VERITUM: elige horario, paga y recibe el enlace de la videollamada.",
  },
  privacidad: { title: "Aviso de privacidad │ VERITUM", description: "Aviso de privacidad de VERITUM." },
  terminos: { title: "Términos de uso │ VERITUM", description: "Términos de uso del sitio de VERITUM." },
  cookies: { title: "Política de cookies │ VERITUM", description: "Política de cookies del sitio de VERITUM." },
};

export const serviceSeo = (name: string, cardText: string): PageSeo => ({
  title: `${name} │ VERITUM`,
  description: cardText,
});

export const articleSeo = (title: string, topics: string[]): PageSeo => ({
  title: `${title} │ Biblioteca VERITUM`,
  description: topics.join(" · "),
});
