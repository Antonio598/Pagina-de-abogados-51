// ============================================================================
// Landing de campaña (/consulta) — PENDIENTE DE APROBACIÓN DE VERITUM.
//
// Textos escritos para los anuncios de Meta. Persuaden con hechos verificables:
// lo que incluye la sesión, cuánto dura, qué pasa después y cuántos horarios
// quedan de verdad. No prometen resultados, no usan miedo y no inventan datos.
// Todas las asesorías son en línea, por videollamada, en todo México.
// ============================================================================

export const landing = {
  promoLabel: "Precio de lanzamiento",
  promoAviso: (minutos: number) => `Este precio se mantiene ${minutos} minutos desde que abriste esta página.`,
  promoExpirada: "La promoción terminó. El precio mostrado es el vigente.",

  hero: {
    eyebrow: "Asesoría legal en línea · Todo México",
    title: "Habla hoy con un abogado y sal de la duda",
    text: "Una videollamada de 45 minutos para entender tu situación, conocer tus opciones reales y salir con los siguientes pasos por escrito. Eliges horario y pagas aquí mismo, en dos minutos.",
    cta: "Agendar mi asesoría",
    puntos: [
      "Videollamada desde donde estés, en todo México",
      "Fecha y hora confirmadas al instante",
      "Abogados de familia, laboral, civil y empresa",
    ],
  },

  // Cifras verificables: duración de la sesión y horas de atención.
  cifras: [
    { valor: 45, sufijo: " min", texto: "de sesión con un abogado" },
    { valor: 4, texto: "áreas de práctica" },
    { valor: 100, sufijo: " %", texto: "en línea, desde donde estés" },
  ],

  escasez: {
    titulo: (n: number) => (n === 1 ? "Queda 1 horario esta semana" : `Quedan ${n} horarios esta semana`),
    texto: "Los horarios se apartan al pagar y se liberan solos si alguien no completa la reserva.",
    pocos: "Últimos horarios disponibles.",
    agotado: {
      titulo: "Esta semana ya no hay horarios",
      texto: "Déjanos tus datos y te avisamos en cuanto se abra el siguiente bloque.",
      cta: "Avísenme cuando haya cupo",
    },
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
      "45 minutos por videollamada con un abogado, no con un vendedor.",
      "Revisión de los documentos que ya tengas.",
      "Diagnóstico claro: qué procede, qué no y qué riesgos existen.",
      "Los siguientes pasos por escrito al terminar.",
      "Si el asunto requiere más trabajo, te explicamos el alcance y el costo antes de decidir.",
    ],
    honestidad:
      "Lo que no vas a encontrar: promesas de resultado. Ningún abogado serio puede garantizarte un fallo. Lo que sí te damos es claridad para decidir con información.",
  },

  objeciones: {
    eyebrow: "Lo que suelen preguntarnos",
    title: "Quítate la duda antes de agendar",
    items: [
      {
        objecion: "“¿Y si no me sirve de nada?”",
        respuesta:
          "Sales con un diagnóstico por escrito: qué procede, qué no y qué sigue. Aunque decidas no contratar nada más, te llevas eso.",
      },
      {
        objecion: "“Prefiero preguntar antes por WhatsApp.”",
        respuesta:
          "Puedes hacerlo con nuestro asistente para dudas del proceso. Lo jurídico se revisa en la sesión: es lo único que da una respuesta seria.",
      },
      {
        objecion: "“No tengo todos mis documentos.”",
        respuesta: "No hace falta. Ven con lo que tengas; parte de la sesión es identificar qué falta y cómo conseguirlo.",
      },
      {
        objecion: "“¿Por qué pagar antes?”",
        respuesta:
          "Porque el pago es lo que aparta tu horario y evita que alguien más lo tome. Recibes factura y el enlace de la videollamada al instante.",
      },
    ],
  },

  pasos: {
    eyebrow: "Cómo funciona",
    title: "Tres pasos y listo",
    items: [
      { titulo: "Eliges día y hora", texto: "Solo ves horarios realmente disponibles." },
      { titulo: "Pagas en línea", texto: "Pago seguro con Stripe. El pago es lo que aparta tu lugar." },
      { titulo: "Recibes tu confirmación", texto: "Con el folio, la hora y el enlace de la videollamada." },
    ],
  },

  confianza: {
    eyebrow: "Con quién hablas",
    title: "Una firma que explica antes de actuar",
    text: "VERITUM es una firma de servicios legales y capital humano. Trabajamos con un método: escuchar, entender, diagnosticar, diseñar, actuar y acompañar.",
  },

  areas: ["Derecho familiar", "Derecho laboral", "Asesoría para empresas", "Derecho civil y contratos"],

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
        q: "¿Cómo es la sesión?",
        a: "Siempre en línea, por videollamada, desde donde estés en México. Recibes el enlace junto con la confirmación; no necesitas instalar nada.",
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

  salida: {
    eyebrow: "Antes de irte",
    title: "Tu precio sigue vigente",
    text: "Puedes apartar tu videollamada ahora y resolver la duda que te trajo hasta aquí.",
    minutos: (n: number) => (n === 1 ? "Queda 1 minuto de precio de lanzamiento" : `Quedan ${n} minutos de precio de lanzamiento`),
    cupo: (n: number) => (n === 1 ? "Queda 1 horario esta semana" : `Quedan ${n} horarios esta semana`),
    cta: "Apartar mi horario",
  },

  agendar: {
    eyebrow: "Reserva",
    title: "Agenda tu asesoría",
    text: "Elige el horario que te acomode y confirma con el pago. Recibirás el correo con tu folio y el enlace de la videollamada.",
    aviso:
      "La asesoría inicial tiene como finalidad conocer tu situación, revisar la información disponible y ofrecer una orientación preliminar. Agendar o pagar una asesoría no garantiza la aceptación del asunto ni un resultado determinado. La representación o realización de trabajos posteriores requiere confirmación expresa del alcance y honorarios. Si tienes una audiencia, vencimiento o notificación próxima, indícalo antes de reservar.",
    canceladoAviso: "El pago se canceló y el horario quedó libre. Puedes elegir otro y volver a intentarlo.",
  },

  confirmacion: {
    titleOk: "Tu asesoría está confirmada",
    textOk: "Te enviamos un correo con el folio, la fecha y el enlace de la videollamada. Si no lo ves, revisa la carpeta de no deseados.",
    titlePendiente: "Estamos confirmando tu pago",
    textPendiente: "Esto tarda unos segundos. No cierres esta página.",
    titleError: "No encontramos ese pago",
    textError: "Si el cargo aparece en tu banco, escríbenos con el folio y lo revisamos de inmediato.",
    prepararTitle: "Qué preparar",
    volver: "Ir al sitio de VERITUM",
  },
} as const;
