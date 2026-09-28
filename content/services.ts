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
    library: ["pension-alimenticia-sin-matrimonio"],
    formType: "familiar",
  },
  {
    slug: "derecho-laboral",
    name: "Defensa y asesoría laboral para patrones y empresas",
    short: "Patrones",
    icon: "briefcase",
    cardText:
      "Defensa del patrón ante citatorios de conciliación y demandas laborales, terminaciones bien documentadas y valoración de contingencias.",
    title: "Defensa laboral del lado del patrón",
    intro:
      "Acompañamos a personas físicas con actividad empresarial y a personas morales cuando un trabajador reclama: leemos lo que se les notificó, valoran qué está en juego y definimos la estrategia antes de que los plazos decidan por ellos.",
    matters: [
      "Citatorios de conciliación: valoración de la contingencia y representación.",
      "Demandas y notificaciones laborales: contestación y defensa.",
      "Terminaciones de la relación de trabajo y negociación de salidas.",
      "Convenios y su ratificación ante la autoridad.",
      "Revisión de contratos, nóminas y documentación laboral.",
      "Actas administrativas, reglamentos y políticas internas.",
      "Valoración de contingencias antes de tomar una decisión.",
    ],
    scopeNotice:
      "Atendemos este servicio del lado del patrón. No podemos representar a las dos partes del mismo asunto: si ya asesoramos a la contraparte, te lo diremos antes de aceptar el caso.",
    faqIds: ["primera-llamada", "garantia", "documentos", "urgencias"],
    library: ["citatorio-conciliacion-patron"],
    formType: "laboral",
  },
  {
    slug: "asesoria-empresas",
    name: "Derecho laboral para trabajadores",
    short: "Trabajadores",
    icon: "users",
    cardText:
      "Orientación para personas trabajadoras sobre lo que les corresponde al terminar su relación de trabajo, y qué hacer si no se lo pagan.",
    title: "Lo que te corresponde, explicado con claridad",
    intro:
      "Si te despidieron, te pidieron firmar tu renuncia o no te pagaron lo que te toca, te explicamos qué dice la ley en tu caso, cuánto es, qué plazos corren y qué puedes hacer. Sin promesas de resultado y con las cuentas a la vista.",
    matters: [
      "Revisión de tu finiquito o liquidación, con el cálculo de lo que corresponde.",
      "Despido injustificado: qué puedes reclamar y en cuánto tiempo.",
      "Renuncias firmadas bajo presión y convenios que ya firmaste.",
      "Aguinaldo, vacaciones, prima vacacional y horas extra no pagadas.",
      "Falta de alta o de pago de cuotas ante el IMSS.",
      "Acompañamiento en la conciliación prejudicial.",
      "Plazos de prescripción: hasta cuándo puedes reclamar.",
    ],
    scopeNotice:
      "Atendemos este servicio del lado de la persona trabajadora. No podemos representar a las dos partes del mismo asunto: si ya asesoramos a tu contraparte, te lo diremos antes de aceptar el caso.",
    faqIds: ["primera-llamada", "costo", "relacion", "en-linea"],
    library: ["terminacion-trabajador"],
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
    library: ["revisar-contrato-antes-de-firmar"],
    formType: "civil",
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
