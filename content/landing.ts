// ============================================================================
// Landing de campaña (/consulta) — PENDIENTE DE APROBACIÓN DE VERITUM.
//
// Estos textos no forman parte del contenido aprobado del sitio: se redactaron
// para la campaña de anuncios siguiendo las reglas de marca (claridad, sin
// prometer resultados, sin miedo ni presión). Antes de invertir en anuncios,
// VERITUM debe revisarlos y autorizarlos.
// ============================================================================

export const landing = {
  promoLabel: "Precio de lanzamiento",
  promoAviso: (minutos: number) => `Descuento válido ${minutos} minutos desde que abriste esta página.`,
  promoExpirada: "La promoción terminó. El precio mostrado es el vigente.",

  hero: {
    eyebrow: "Asesoría legal · CDMX y Estado de México",
    title: "Habla hoy con un abogado y sal de la duda",
    text: "Una sesión de 45 minutos para entender tu situación, conocer tus opciones reales y salir con los siguientes pasos por escrito. Agendas y pagas aquí mismo, en dos minutos.",
    cta: "Agendar mi asesoría",
    ctaSecundario: "Ver cómo funciona",
    puntos: ["Respuesta con fecha y hora confirmadas", "Atención en línea o presencial", "Abogados de familia, laboral, civil y empresa"],
  },

  video: {
    eyebrow: "En 60 segundos",
    title: "Así te ayudamos",
    play: "Reproducir video",
  },

  paraTi: {
    eyebrow: "Para quién es",
    title: "Esto es para ti si…",
    items: [
      {
        titulo: "Necesitas resolver una pensión o una separación",
        texto: "Pensión alimenticia, custodia, convivencias o divorcio: saber qué te corresponde antes de firmar algo cambia el resultado.",
      },
      {
        titulo: "Te despidieron o te piden firmar tu renuncia",
        texto: "Finiquito, liquidación, actas administrativas. Entender qué estás firmando es lo primero.",
      },
      {
        titulo: "Tienes un contrato que no se está cumpliendo",
        texto: "Adeudos, incumplimientos, acuerdos verbales. Revisamos qué tienes documentado y qué se puede exigir.",
      },
      {
        titulo: "Tu empresa necesita orden antes de un problema",
        texto: "Contratos, documentación laboral y prevención de riesgos, con una visión práctica de la operación.",
      },
    ],
  },

  incluye: {
    eyebrow: "Qué incluye",
    title: "Qué pasa en tu asesoría",
    items: [
      "45 minutos con un abogado, no con un vendedor.",
      "Revisión de los documentos que ya tengas.",
      "Diagnóstico claro: qué procede, qué no y qué riesgos existen.",
      "Los siguientes pasos por escrito al terminar.",
      "Si el asunto requiere más trabajo, te explicamos el alcance y el costo antes de decidir.",
    ],
    honestidad:
      "Lo que no vas a encontrar: promesas de resultado. Ningún abogado serio puede garantizarte un fallo. Lo que sí te damos es claridad para decidir con información.",
  },

  pasos: {
    eyebrow: "Cómo funciona",
    title: "Tres pasos y listo",
    items: [
      { titulo: "Eliges día y hora", texto: "Solo ves horarios realmente disponibles." },
      { titulo: "Pagas en línea", texto: "Pago seguro con Stripe. El pago es lo que aparta tu lugar." },
      { titulo: "Recibes tu confirmación", texto: "Te llega por correo con el folio, la hora y qué preparar." },
    ],
  },

  confianza: {
    eyebrow: "Con quién hablas",
    title: "Una firma que explica antes de actuar",
    text: "VERITUM es una firma de servicios legales y capital humano. Trabajamos con un método: escuchar, entender, diagnosticar, diseñar, actuar y acompañar.",
  },

  faq: {
    eyebrow: "Dudas frecuentes",
    title: "Antes de agendar",
    extra: [
      {
        id: "landing-precio",
        q: "¿Qué incluye el precio?",
        a: "La sesión completa de asesoría inicial con un abogado, la revisión de la información que compartas y los siguientes pasos por escrito. Si después decides contratar un servicio adicional, se te presenta el alcance y los honorarios por separado.",
      },
      {
        id: "landing-reprogramar",
        q: "¿Puedo reprogramar?",
        a: "Sí. Responde el correo de confirmación con al menos 24 horas de anticipación y te damos un nuevo horario disponible.",
      },
      {
        id: "landing-linea",
        q: "¿La sesión es en línea?",
        a: "Puede ser en línea por videollamada o presencial en la Ciudad de México y el Estado de México. Lo confirmamos en el correo.",
      },
    ],
  },

  agente: {
    title: "¿Prefieres preguntar antes?",
    text: "Nuestro asistente resuelve dudas sobre el proceso, los tiempos y lo que incluye la asesoría. No da respuestas jurídicas: para eso está la sesión con un abogado.",
    cta: "Escribir al asistente",
  },

  cierre: {
    title: "Tu situación no se resuelve sola",
    text: "Agenda tu asesoría y sal de la incertidumbre con información concreta.",
    cta: "Agendar mi asesoría",
  },

  barra: { cta: "Agendar", asistente: "Preguntar" },

  agendar: {
    eyebrow: "Reserva",
    title: "Agenda tu asesoría",
    text: "Elige el horario que te acomode y confirma con el pago. Recibirás el correo con tu folio de inmediato.",
    aviso:
      "La asesoría inicial tiene como finalidad conocer tu situación, revisar la información disponible y ofrecer una orientación preliminar. Agendar o pagar una asesoría no garantiza la aceptación del asunto ni un resultado determinado. La representación o realización de trabajos posteriores requiere confirmación expresa del alcance y honorarios. Si tienes una audiencia, vencimiento o notificación próxima, indícalo antes de reservar.",
    canceladoAviso: "El pago se canceló y el horario quedó libre. Puedes elegir otro y volver a intentarlo.",
  },

  confirmacion: {
    titleOk: "Tu asesoría está confirmada",
    textOk: "Te enviamos un correo con el folio, la fecha y qué preparar. Si no lo ves, revisa la carpeta de no deseados.",
    titlePendiente: "Estamos confirmando tu pago",
    textPendiente: "Esto tarda unos segundos. No cierres esta página.",
    titleError: "No encontramos ese pago",
    textError: "Si el cargo aparece en tu banco, escríbenos con el folio y lo revisamos de inmediato.",
    prepararTitle: "Qué preparar",
    volver: "Ir al sitio de VERITUM",
  },
} as const;
