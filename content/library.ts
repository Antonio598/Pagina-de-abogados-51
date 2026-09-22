// Biblioteca — contenido aprobado (Bloque 5).
// Los "topics" provienen del enfoque aprobado de cada recurso; el cuerpo completo
// de cada guía lo entrega VERITUM y se carga en `body` (o desde el CMS).
// Mientras `downloadUrl` esté vacío, los CTA de descarga canalizan a Contacto
// con el recurso identificado: nunca un enlace roto.

import type { FormType } from "./services";

export type LibraryCategory =
  | "Familia y pensiones"
  | "Trabajo y relaciones laborales"
  | "Contratos y obligaciones"
  | "Prevención legal para empresas"
  | "Guías y listas de verificación";

export const libraryCategories: LibraryCategory[] = [
  "Familia y pensiones",
  "Trabajo y relaciones laborales",
  "Contratos y obligaciones",
  "Prevención legal para empresas",
  "Guías y listas de verificación",
];

export type ArticleSection = { heading: string; paragraphs?: string[]; list?: string[] };

export type LibraryResource = {
  slug: string;
  title: string;
  /** Nombre con el que aparece en "Biblioteca destacada" de Inicio (texto aprobado). */
  homeTitle: string;
  kind: "Guía" | "Checklist" | "Artículo" | "Plantilla";
  categories: LibraryCategory[];
  /** Puntos que cubre el recurso (del enfoque aprobado). */
  topics: string[];
  cta: { label: string; kind: "agenda" | "download" | "contact" };
  downloadUrl?: string;
  serviceSlug: string;
  formType: FormType;
  faqIds: string[];
  publishedAt: string;
  updatedAt: string;
  author: string;
  readingMinutes: number;
  body?: ArticleSection[];
};

export const library = {
  title: "Herramientas legales para comprender y prepararte",
  text: "Explora guías prácticas, listas de verificación y artículos informativos. Su finalidad es ayudarte a ordenar información y reconocer cuándo conviene solicitar asesoría.",
  allLabel: "Todos",
  coversLabel: "Qué cubre este recurso",
  notice: "Contenido informativo, no asesoría jurídica.",
  relatedLabel: "Contenidos relacionados",
  serviceLabel: "Servicio relacionado",
  faqLabel: "Preguntas frecuentes relacionadas",
  readingLabel: "min de lectura",
  publishedLabel: "Publicado",
  updatedLabel: "Actualizado",
  authorLabel: "Responsable",
} as const;

export const resources: LibraryResource[] = [
  {
    slug: "pension-alimenticia-sin-matrimonio",
    title: "Pensión alimenticia sin matrimonio",
    homeTitle: "Pensión alimenticia aunque no haya matrimonio",
    kind: "Artículo",
    categories: ["Familia y pensiones"],
    topics: [
      "El derecho a la pensión no depende necesariamente del matrimonio.",
      "Información a reunir antes de una revisión.",
      "Cada situación requiere análisis individual; no existe procedencia automática.",
    ],
    cta: { label: "Agenda una revisión", kind: "agenda" },
    serviceSlug: "derecho-familiar",
    formType: "familiar",
    faqIds: ["primera-llamada", "documentos", "garantia"],
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    author: "VERITUM",
    readingMinutes: 4,
  },
  {
    slug: "checklist-separacion",
    title: "Checklist para una separación",
    homeTitle: "Checklist legal para una separación",
    kind: "Checklist",
    categories: ["Familia y pensiones", "Guías y listas de verificación"],
    topics: ["Documentos", "Gastos", "Bienes", "Hijas e hijos", "Comunicaciones", "Fechas relevantes"],
    cta: { label: "Descargar guía", kind: "download" },
    serviceSlug: "derecho-familiar",
    formType: "familiar",
    faqIds: ["documentos", "urgencias"],
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    author: "VERITUM",
    readingMinutes: 5,
  },
  {
    slug: "senales-legales",
    title: "Señales legales que no conviene ignorar",
    homeTitle: "Señales de alerta que requieren asesoría legal",
    kind: "Guía",
    categories: [
      "Trabajo y relaciones laborales",
      "Contratos y obligaciones",
      "Prevención legal para empresas",
    ],
    topics: [
      "Notificaciones",
      "Presiones para firmar",
      "Incumplimientos",
      "Fechas próximas",
      "Pérdida de documentos",
    ],
    cta: { label: "Consultar a VERITUM", kind: "contact" },
    serviceSlug: "asesoria-empresas",
    formType: "empresa",
    faqIds: ["urgencias", "primera-llamada"],
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    author: "VERITUM",
    readingMinutes: 4,
  },
  {
    slug: "registro-de-gastos",
    title: "Registro de gastos",
    homeTitle: "Registro de gastos para asuntos de pensión",
    kind: "Plantilla",
    categories: ["Familia y pensiones", "Guías y listas de verificación"],
    topics: ["Gastos ordinarios", "Gastos extraordinarios", "Comprobantes"],
    cta: { label: "Descargar formato", kind: "download" },
    serviceSlug: "derecho-familiar",
    formType: "familiar",
    faqIds: ["documentos"],
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-01",
    author: "VERITUM",
    readingMinutes: 3,
  },
];

export const getResource = (slug: string) => resources.find((r) => r.slug === slug);

export const resourceHref = (r: LibraryResource) => {
  if (r.cta.kind === "agenda") return `/agenda?tipo=${r.formType}`;
  if (r.cta.kind === "download" && r.downloadUrl) return r.downloadUrl;
  return `/contacto?asunto=${r.formType}&recurso=${r.slug}`;
};
