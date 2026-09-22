// Contacto, formulario y agenda — contenido literal aprobado (Bloques 5 y 6).

export const contact = {
  title: "Hablemos de tu situación",
  text: "Cuéntanos brevemente qué necesitas. Revisaremos tu mensaje para confirmar si podemos ayudarte y cuál es el siguiente paso. Evita enviar información confidencial extensa hasta recibir indicaciones.",
  dataTitle: "Datos de contacto",
  coverageLabel: "Cobertura",
  faqTitle: "Preguntas frecuentes",
  labels: {
    telefono: "Teléfono",
    whatsapp: "WhatsApp",
    correo: "Correo",
    domicilio: "Domicilio o zona de atención",
    horario: "Horario",
    modalidad: "Modalidad",
    redes: "Redes sociales oficiales",
  },
} as const;

export const asuntoOptions = [
  { value: "familiar", label: "Familiar" },
  { value: "laboral", label: "Laboral" },
  { value: "empresa", label: "Empresa" },
  { value: "civil", label: "Civil o contratos" },
  { value: "otro", label: "Otro" },
] as const;

export const canalOptions = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "llamada", label: "Llamada" },
  { value: "correo", label: "Correo" },
] as const;

export const contactForm = {
  fields: {
    nombre: "Nombre completo",
    correo: "Correo electrónico",
    telefono: "Teléfono",
    telefonoHint: "Incluye la clave de país, por ejemplo +52.",
    entidad: "Entidad",
    municipio: "Municipio o alcaldía",
    asunto: "Tipo de asunto",
    descripcion: "Breve descripción",
    fecha: "Fecha próxima relevante",
    fechaHint: "Opcional. Audiencia, vencimiento o notificación.",
    canal: "Canal preferido",
    privacidad: "He leído y acepto el",
    privacidadLink: "aviso de privacidad",
  },
  submit: "Enviar solicitud",
  sending: "Enviando…",
  afterSubmit:
    "Al enviar, tu solicitud llega al equipo de VERITUM, que la revisa y responde por el canal que elegiste.",
  successTitle: "Recibimos tu solicitud",
  successText: (plazo: string, canal: string) =>
    `VERITUM revisará tu mensaje y te responderá por ${canal} en un plazo de ${plazo}. El envío de este formulario no suspende plazos ni crea una relación abogado cliente.`,
  errorTitle: "No pudimos enviar tu solicitud",
  errorText: "Inténtalo de nuevo en unos minutos. Si tienes una fecha próxima, utiliza un canal de contacto directo.",
  maxChars: 1000,
  errors: {
    nombre: "Escribe tu nombre completo.",
    correo: "Escribe un correo electrónico válido.",
    telefono: "Escribe un teléfono válido con clave de país.",
    entidad: "Indica la entidad.",
    asunto: "Selecciona el tipo de asunto.",
    descripcion: "Describe brevemente tu situación.",
    descripcionMax: "La descripción no puede exceder 1,000 caracteres.",
    canal: "Selecciona un canal preferido.",
    privacidad: "Es necesario aceptar el aviso de privacidad.",
    fecha: "Escribe una fecha válida.",
  },
  resourceNote: (title: string) => `Solicitud relacionada con el recurso: ${title}.`,
} as const;

export const agenda = {
  title: "Agenda asesoría",
  notice:
    "La asesoría inicial tiene como finalidad conocer tu situación, revisar la información disponible y ofrecer una orientación preliminar. Agendar o pagar una asesoría no garantiza la aceptación del asunto ni un resultado determinado. La representación o realización de trabajos posteriores requiere confirmación expresa del alcance y honorarios. Si tienes una audiencia, vencimiento o notificación próxima, indícalo antes de reservar.",
  ack: "He leído este aviso y deseo continuar.",
  continueLabel: "Continuar",
  steps: ["Aviso", "Datos de la reserva", "Confirmación"],
  detailsTitle: "Datos de la reserva",
  fields: {
    modalidad: "Modalidad disponible",
    fecha: "Fecha preferida",
    hora: "Hora preferida",
    urgente: "Fecha próxima (audiencia, vencimiento o notificación)",
    duracion: "Duración de la sesión",
    precio: "Precio vigente",
    terminos: "Acepto los",
    terminosLink: "términos de uso",
    y: "y el",
  },
  policyTitle: "Reprogramación, cancelación y no asistencia",
  // Política pendiente de confirmación por VERITUM; se muestra solo si está definida.
  policy: process.env.NEXT_PUBLIC_POLITICA_CANCELACION?.trim() || undefined,
  submit: "Solicitar reserva",
  externalLabel: "Elegir fecha y hora",
  successTitle: "Solicitud de reserva recibida",
  successText: (plazo: string) =>
    `VERITUM confirmará la disponibilidad, la modalidad y las condiciones de la asesoría en un plazo de ${plazo}, por correo electrónico. La reserva no está confirmada hasta recibir esa respuesta.`,
  errors: {
    modalidad: "Selecciona una modalidad.",
    fecha: "Selecciona una fecha.",
    hora: "Selecciona una hora.",
    terminos: "Es necesario aceptar los términos y el aviso de privacidad.",
  },
} as const;
