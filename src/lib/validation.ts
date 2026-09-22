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

export const agendaSchema = z.object({
  nombre: z.string().trim().min(3, e.nombre).max(120, e.nombre),
  correo: z.string().trim().email(e.correo).max(160, e.correo),
  telefono: phone,
  asunto: z.enum(asuntoValues, { message: e.asunto }),
  modalidad: z.string().trim().optional(),
  fecha: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha."),
  hora: z.string().trim().regex(/^\d{2}:\d{2}$/, "Selecciona una hora."),
  urgente: optionalDate,
  terminos: z.literal(true, { message: "Es necesario aceptar los términos y el aviso de privacidad." }),
  empresa_web: z.string().optional(),
});

export type AgendaInput = z.infer<typeof agendaSchema>;
