// Lectura tipada de variables públicas. Cada variable vacía hace que su bloque
// de interfaz no se renderice: nunca se muestra un marcador visible.
// Las referencias a process.env.NEXT_PUBLIC_* deben ser literales para que
// Next.js las sustituya en tiempo de compilación.

const clean = (v: string | undefined) => {
  const s = (v ?? "").trim();
  return s.length > 0 ? s : undefined;
};

export const env = {
  siteUrl: clean(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://veritum.com.mx",

  // Datos de contacto {{telefono}} {{correo}} {{domicilio}} {{horario}} {{modalidad}} {{redes}}
  telefono: clean(process.env.NEXT_PUBLIC_TELEFONO),
  whatsapp: clean(process.env.NEXT_PUBLIC_WHATSAPP),
  correo: clean(process.env.NEXT_PUBLIC_CORREO),
  domicilio: clean(process.env.NEXT_PUBLIC_DOMICILIO),
  horario: clean(process.env.NEXT_PUBLIC_HORARIO),
  /** Todas las asesorías son por videollamada: no hay sesiones presenciales. */
  modalidad: clean(process.env.NEXT_PUBLIC_MODALIDAD) ?? "En línea (videollamada)",
  /** Respuesta a "¿Atienden en línea?" {{modalidades}} */
  modalidades:
    clean(process.env.NEXT_PUBLIC_MODALIDADES) ??
    "Sí. Todas las asesorías son en línea, por videollamada, desde cualquier parte de México. Recibes el enlace junto con la confirmación.",
  redes: {
    linkedin: clean(process.env.NEXT_PUBLIC_REDES_LINKEDIN),
    facebook: clean(process.env.NEXT_PUBLIC_REDES_FACEBOOK),
    instagram: clean(process.env.NEXT_PUBLIC_REDES_INSTAGRAM),
  },

  // Formularios y agenda
  /** Plazo real de respuesta confirmado por VERITUM; sin él, el mensaje de éxito no promete tiempos. */
  plazoRespuesta: clean(process.env.NEXT_PUBLIC_PLAZO_RESPUESTA),
  /** {{precios}} — si está vacío, la línea de precio no se muestra. */
  precioAsesoria: clean(process.env.NEXT_PUBLIC_PRECIO_ASESORIA),
  duracionAsesoria: clean(process.env.NEXT_PUBLIC_DURACION_ASESORIA),
  /** {{proveedor_agenda}} — URL del proveedor autorizado (Calendly, Cal.com, etc.). */
  agendaUrl: clean(process.env.NEXT_PUBLIC_AGENDA_URL),

  // Landing de campaña (/consulta)
  /** URL del agente de IA (WhatsApp, Messenger o web). Vacío = el botón no aparece. */
  agenteIaUrl: clean(process.env.NEXT_PUBLIC_AGENTE_IA_URL),
  /** Video MP4 de la landing servido desde /public. Vacío = el bloque no aparece. */
  landingVideo: clean(process.env.NEXT_PUBLIC_LANDING_VIDEO),
  landingVideoPoster: clean(process.env.NEXT_PUBLIC_LANDING_VIDEO_POSTER),

  // Medición
  gtmId: clean(process.env.NEXT_PUBLIC_GTM_ID),
} as const;

export const whatsappHref = env.whatsapp
  ? `https://wa.me/${env.whatsapp.replace(/[^\d]/g, "")}`
  : undefined;

export const telHref = env.telefono ? `tel:${env.telefono.replace(/[^\d+]/g, "")}` : undefined;
export const mailHref = env.correo ? `mailto:${env.correo}` : undefined;

export const hasContactData = Boolean(
  env.telefono || env.whatsapp || env.correo || env.domicilio || env.horario || env.modalidad,
);

export const socialLinks = [
  { name: "LinkedIn", href: env.redes.linkedin },
  { name: "Facebook", href: env.redes.facebook },
  { name: "Instagram", href: env.redes.instagram },
].filter((s): s is { name: string; href: string } => Boolean(s.href));
