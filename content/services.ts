// Servicios — contenido literal aprobado (Bloque 5).

export type ServiceSlug =
  | "derecho-familiar"
  | "derecho-laboral"
  | "asesoria-empresas"
  | "derecho-civil-contratos";

export type ServiceIcon = "users" | "briefcase" | "building" | "file-text";
export type FormType = "familiar" | "laboral" | "empresa" | "civil";

export type Service = {
  slug: ServiceSlug;
  name: string;
  short: string;
  icon: ServiceIcon;
  cardText: string;
  title: string;
  intro: string;
  matters: string[];
  scopeNotice?: string;
  /** Preguntas frecuentes generales que aplican al área (ids de faqs.ts). */
  faqIds: string[];
  /** Slugs de Biblioteca relacionados. */
  library: string[];
  /** Selector de tipo de asunto en formularios. */
  formType: FormType;
};

export const commonClosing = {
  question: "¿Tu situación no aparece en la lista?",
  text: "Agenda una asesoría para revisar si podemos atenderla o señalarte el tipo de apoyo que necesitas. La recepción de información no crea por sí misma una relación abogado cliente. Esta se formaliza únicamente mediante aceptación expresa del servicio y, en su caso, la documentación correspondiente.",
  cta: { label: "Agenda una asesoría", href: "/agenda" },
} as const;

export const commonScopeNotice =
  "La procedencia de una acción, sus requisitos y los resultados posibles dependen de los hechos, documentos y legislación aplicable. La información del sitio no sustituye una asesoría.";

export const servicesLabels = {
  title: "Servicios",
  mattersTitle: "Asuntos que podemos revisar",
  howTitle: "Forma de trabajo",
  faqTitle: "Preguntas frecuentes del área",
  scopeTitle: "Aviso de alcance",
  libraryTitle: "Biblioteca relacionada",
  cardCta: "Conocer servicio",
} as const;

export const services: Service[] = [
  {
    slug: "derecho-familiar",
    name: "Derecho familiar",
    short: "Familia",
    icon: "users",
    cardText:
      "Orientación y estrategia en pensión alimenticia, pensión compensatoria, separación, divorcio, guarda y custodia y convivencia.",
    title: "Decisiones familiares con orientación jurídica clara",
    intro:
      "Los conflictos familiares combinan consecuencias legales, económicas y personales. En VERITUM analizamos cada situación con sensibilidad y rigor para definir una ruta que proteja derechos, responsabilidades y bienestar familiar.",
    matters: [
      "Pensión alimenticia para hijas, hijos u otras personas con derecho.",
      "Pensión compensatoria y consecuencias económicas de una separación.",
      "Divorcio y convenios relacionados.",
      "Guarda y custodia.",
      "Régimen de convivencias.",
      "Reconocimiento de paternidad.",
      "Modificación o cumplimiento de acuerdos y resoluciones.",
      "Orientación preventiva antes de una separación.",
    ],
    scopeNotice:
      "La procedencia de una acción, sus requisitos y los resultados posibles dependen de los hechos, documentos y legislación aplicable. La información del sitio no sustituye una asesoría.",
    faqIds: ["primera-llamada", "garantia", "documentos", "urgencias"],
    library: ["pension-alimenticia-sin-matrimonio", "checklist-separacion", "registro-de-gastos"],
    formType: "familiar",
  },
  {
    slug: "derecho-laboral",
    name: "Derecho laboral",
    short: "Trabajo",
    icon: "briefcase",
    cardText:
      "Asesoría para trabajadores y empresas en relaciones laborales, terminaciones, documentación preventiva y conflictos.",
    title: "Acompañamiento laboral para decisiones responsables",
    intro:
      "Asesoramos a trabajadores y empresas para entender derechos, obligaciones, riesgos y alternativas ante situaciones laborales, con atención especial a la documentación y a la prevención de controversias.",
    matters: [
      "Revisión de terminaciones laborales, renuncias y despidos.",
      "Orientación sobre prestaciones, finiquitos y liquidaciones.",
      "Contratos y documentación laboral.",
      "Actas administrativas y procesos internos.",
      "Reglamentos, políticas y medidas preventivas.",
      "Atención inicial de conflictos y definición de estrategia.",
      "Acompañamiento a empresas en decisiones de recursos humanos.",
    ],
    faqIds: ["primera-llamada", "garantia", "documentos", "urgencias"],
    library: ["senales-legales"],
    formType: "laboral",
  },
  {
    slug: "asesoria-empresas",
    name: "Asesoría para empresas",
    short: "Empresa",
    icon: "building",
    cardText:
      "Prevención de riesgos, contratos, cumplimiento interno y acompañamiento en decisiones empresariales.",
    title: "Prevención jurídica para operar con mayor certeza",
    intro:
      "Acompañamos a empresas y áreas directivas a identificar riesgos, documentar relaciones y tomar decisiones con una visión jurídica práctica, preventiva y alineada con la operación.",
    matters: [
      "Diagnóstico legal preventivo.",
      "Revisión y elaboración de contratos.",
      "Políticas, procedimientos y documentación interna.",
      "Prevención y manejo de riesgos laborales.",
      "Revisión de relaciones con proveedores y prestadores.",
      "Acompañamiento en cumplimiento y toma de decisiones.",
      "Estrategias de prevención y atención de controversias.",
    ],
    faqIds: ["primera-llamada", "costo", "relacion", "en-linea"],
    library: ["senales-legales"],
    formType: "empresa",
  },
  {
    slug: "derecho-civil-contratos",
    name: "Derecho civil y contratos",
    short: "Contratos",
    icon: "file-text",
    cardText:
      "Revisión y elaboración de contratos, obligaciones, incumplimientos y controversias civiles.",
    title: "Acuerdos claros y soluciones ante incumplimientos",
    intro:
      "Revisamos relaciones civiles y contractuales para definir obligaciones, prevenir ambigüedades y establecer una estrategia cuando existe incumplimiento o controversia.",
    matters: [
      "Elaboración y revisión de contratos.",
      "Convenios y reconocimiento de obligaciones.",
      "Incumplimientos contractuales.",
      "Requerimientos y negociación.",
      "Daños, responsabilidades y controversias civiles.",
      "Análisis documental y estrategia de recuperación o defensa.",
    ],
    faqIds: ["primera-llamada", "garantia", "costo", "urgencias"],
    library: ["senales-legales"],
    formType: "civil",
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
