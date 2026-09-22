// Preguntas frecuentes generales — contenido literal aprobado (Bloque 5).
import { env } from "@/lib/env";

export type Faq = { id: string; q: string; a: string };

export const faqs: Faq[] = [
  {
    id: "primera-llamada",
    q: "¿La primera llamada es una asesoría?",
    a: "El contacto inicial sirve para conocer de forma breve el tipo de asunto y explicar el proceso. La asesoría jurídica se realiza en la sesión agendada.",
  },
  {
    id: "garantia",
    q: "¿Pueden garantizar el resultado?",
    a: "No. Todo asunto depende de sus hechos, pruebas, contraparte, autoridades y marco legal. VERITUM explica escenarios y trabaja con una estrategia, sin prometer resultados.",
  },
  {
    id: "documentos",
    q: "¿Qué documentos debo enviar?",
    a: "Después de conocer el tipo de asunto, se indicarán los documentos pertinentes. No envíes originales ni información sensible por canales no autorizados.",
  },
  // "¿Atienden en línea?" responde con la variable {{modalidades}}; si no está definida, la pregunta se omite.
  ...(env.modalidades ? [{ id: "en-linea", q: "¿Atienden en línea?", a: env.modalidades }] : []),
  {
    id: "costo",
    q: "¿Cuánto cuesta un proceso?",
    a: "Los honorarios dependen del alcance y complejidad. Después de la valoración se presenta una propuesta clara.",
  },
  {
    id: "relacion",
    q: "¿Agendar crea una relación abogado cliente?",
    a: "No por sí mismo. La relación profesional y su alcance se formalizan expresamente.",
  },
  {
    id: "urgencias",
    q: "¿Atienden urgencias?",
    a: "Indica cualquier fecha próxima. La disponibilidad y posibilidad de intervención deben confirmarse; el envío de un formulario no suspende plazos.",
  },
];

export const faqsById = (ids: string[]) =>
  ids.map((id) => faqs.find((f) => f.id === id)).filter((f): f is Faq => Boolean(f));

/** FAQ esenciales para Inicio. */
export const essentialFaqIds = ["primera-llamada", "garantia", "costo", "relacion"];
