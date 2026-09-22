// Esquemas de validación compartidos entre cliente y servidor (Bloque 6).
import { z } from "zod";
import { contactForm } from "@content/contact";

const e = contactForm.errors;

export const asuntoValues = ["familiar", "laboral", "empresa", "civil", "otro"] as const;
export const canalValues = ["whatsapp", "llamada", "correo"] as const;

const phone = z
  .string()
  .trim()
  .min(8, e.telefono)
  .max(20, e.telefono)
  .regex(/^\+?[\d\s().-]{8,20}$/, e.telefono);

// Fecha opcional: vacía o en formato AAAA-MM-DD (sin transformaciones para que
// los tipos de entrada y salida coincidan en react-hook-form).
const optionalDate = z.string().trim().regex(/^(\d{4}-\d{2}-\d{2})?$/, e.fecha).optional();

export const contactSchema = z.object({
  nombre: z.string().trim().min(3, e.nombre).max(120, e.nombre),
  correo: z.string().trim().email(e.correo).max(160, e.correo),
  telefono: phone,
  entidad: z.string().trim().min(2, e.entidad).max(80, e.entidad),
  municipio: z.string().trim().max(80).optional().or(z.literal("")),
  asunto: z.enum(asuntoValues, { message: e.asunto }),
  descripcion: z.string().trim().min(10, e.descripcion).max(contactForm.maxChars, e.descripcionMax),
  fecha: optionalDate,
  canal: z.enum(canalValues, { message: e.canal }),
  privacidad: z.literal(true, { message: e.privacidad }),
  recurso: z.string().trim().max(80).optional().or(z.literal("")),
  // Honeypot: se evalúa en el servidor antes de validar (debe llegar vacío).
  empresa_web: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

// Reserva con pago: el horario se identifica por el inicio exacto en UTC que
// devolvió el servidor, no por una fecha y hora escritas a mano.
export const reservaSchema = z.object({
  nombre: z.string().trim().min(3, e.nombre).max(120, e.nombre),
  correo: z.string().trim().email(e.correo).max(160, e.correo),
  telefono: phone,
  asunto: z.enum(asuntoValues, { message: e.asunto }),
  modalidad: z.string().trim().max(60).optional().or(z.literal("")),
  entidad: z.string().trim().max(80).optional().or(z.literal("")),
  municipio: z.string().trim().max(80).optional().or(z.literal("")),
  descripcion: z.string().trim().max(contactForm.maxChars, e.descripcionMax).optional().or(z.literal("")),
  urgente: optionalDate,
  slot: z.string().trim().datetime({ message: "Selecciona un horario disponible." }),
  terminos: z.literal(true, { message: "Es necesario aceptar los términos y el aviso de privacidad." }),
  origen: z.enum(["landing", "sitio"]),
  utm: z.record(z.string(), z.string().max(120)).optional(),
  empresa_web: z.string().optional(),
});

export type ReservaInput = z.infer<typeof reservaSchema>;
