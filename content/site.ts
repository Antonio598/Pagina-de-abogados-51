// Identidad y navegación de VERITUM. Textos aprobados: no reescribir sin autorización.

export const site = {
  name: "VERITUM",
  descriptor: "Capital Humano & Legal",
  tagline: "Estrategia legal con claridad y acompañamiento humano.",
  coverage: "Ciudad de México y Estado de México",
  legalNotice:
    "La información de este sitio es general y no constituye asesoría legal. Cada asunto requiere valoración individual.",
  pillars: ["Claridad", "Estrategia", "Acompañamiento", "Prevención", "Protección"],
  method: ["Escuchar", "Entender", "Diagnosticar", "Diseñar", "Actuar", "Acompañar"],
} as const;

export type NavChild = { label: string; href: string; short: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

export const serviceLinks: NavChild[] = [
  { label: "Derecho familiar", href: "/servicios/derecho-familiar", short: "Familia" },
  { label: "Derecho laboral", href: "/servicios/derecho-laboral", short: "Trabajo" },
  { label: "Asesoría para empresas", href: "/servicios/asesoria-empresas", short: "Empresa" },
  { label: "Derecho civil y contratos", href: "/servicios/derecho-civil-contratos", short: "Contratos" },
];

export const mainNav: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/servicios", children: serviceLinks },
  { label: "Quiénes somos", href: "/quienes-somos" },
  { label: "Proceso", href: "/proceso" },
  { label: "Estrategia legal preventiva", href: "/estrategia-preventiva" },
  { label: "Biblioteca", href: "/biblioteca" },
  { label: "Contacto", href: "/contacto" },
];

export const agendaCta = { label: "Agenda asesoría", href: "/agenda" } as const;

export const footerNav = [
  { label: "Inicio", href: "/" },
  { label: "Servicios", href: "/servicios" },
  { label: "Quiénes somos", href: "/quienes-somos" },
  { label: "Proceso", href: "/proceso" },
  { label: "Biblioteca", href: "/biblioteca" },
  { label: "Contacto", href: "/contacto" },
  { label: "Agenda", href: "/agenda" },
] as const;

export const legalNav = [
  { label: "Aviso de privacidad", href: "/aviso-de-privacidad" },
  { label: "Términos de uso", href: "/terminos-de-uso" },
  { label: "Política de cookies", href: "/politica-de-cookies" },
] as const;
