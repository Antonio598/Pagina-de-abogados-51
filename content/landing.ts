// ============================================================================
// Landing de campaña (/consulta) — PENDIENTE DE APROBACIÓN DE VERITUM.
//
// DEFENSA LABORAL PARA PATRONES. Público: personas físicas con actividad
// empresarial y personas morales con conflictos laborales con sus trabajadores.
// No es una landing para trabajadores ni de servicios jurídicos generales.
//
// Quien llega acaba de recibir una demanda o un citatorio. El registro es
// empático y profesional: vende porque genera confianza, no por presión.
//
// Reglas que estos textos respetan:
//   · No prometen ningún resultado.
//   · No inventan cifras, testimonios, años de experiencia ni casos ganados:
//     no existe fuente para ninguna de esas cosas.
//   · No usan miedo ni urgencia artificial. No hay cuenta atrás ni descuento
//     que caduque; el argumento es el crédito de representación, que es real.
//   · Dicen en voz alta lo que NO hacemos (alcance patronal, sin garantías).
// ============================================================================

export const landing = {
  hero: {
    eyebrow: "Defensa laboral para patrones y empresas",
    title: "¿Recibiste una demanda o un citatorio laboral?",
    text: "Sabemos que enfrentar un conflicto laboral puede generar incertidumbre para ti y tu empresa. En VERITUM analizamos tu situación, te explicamos tus opciones con claridad y diseñamos una estrategia jurídica para atender tu caso y proteger los intereses de tu negocio.",
    cta: "Revisar mi caso laboral",
    puntos: [
      "Atendemos solo del lado del patrón: es en lo que nos especializamos",
      "Te decimos qué te reclaman, qué plazos corren y qué puedes hacer",
      "Videollamada desde donde estés, en todo México",
    ],
  },

  // Cinta de alcance. Sustituye a la tira de cifras anterior: decía "45 min" y
  // "4 áreas de práctica", y ninguna de las dos cosas es cierta ahora.
  alcance: [
    "Citatorio de conciliación",
    "Demanda laboral",
    "Terminación y convenios",
    "Solo lado patronal",
    "En línea · todo México",
  ],

  situaciones: {
    eyebrow: "Empieza por aquí",
    title: "¿En cuál de estas situaciones estás?",
    text: "Identifica la tuya y te decimos cuál es el siguiente paso. Las demás contingencias laborales se atienden dentro de estas tres rutas.",
    cta: "Revisar mi caso",
  },

  soloPatronal: {
    eyebrow: "Nuestro alcance",
    title: "Defendemos al patrón, y solo al patrón",
    text: "No representamos a trabajadores en asuntos laborales. Lo decimos desde el principio por dos razones: porque así no hay conflicto de interés en tu asunto, y porque toda nuestra práctica está construida para el lado en el que tú estás.",
    puntos: [
      "Representación ante el Centro de Conciliación y defensa judicial.",
      "Terminaciones, convenios y negociación de salidas.",
      "Revisión de documentación laboral y valoración de contingencias.",
    ],
    noHacemos: "No atendemos demandas de trabajadores contra empresas, ni asuntos ajenos a la materia laboral.",
  },

  comoTrabajamos: {
    eyebrow: "Cómo trabajamos",
    title: "Un orden claro, desde la primera llamada",
    items: [
      {
        titulo: "Escuchamos y leemos lo que recibiste",
        texto: "Qué te notificaron, cuándo te lo entregaron y qué te reclaman exactamente.",
      },
      {
        titulo: "Valoramos la contingencia",
        texto: "Qué está en juego según tus documentos y qué plazos están corriendo. Con números, no con adjetivos.",
      },
      {
        titulo: "Te explicamos tus opciones",
        texto: "Cada camino con su riesgo, su costo y su tiempo. Incluida la opción de no litigar, cuando conviene.",
      },
      {
        titulo: "Definimos la estrategia y los siguientes pasos",
        texto: "Por escrito, al terminar la sesión, para que puedas decidir con la información delante.",
      },
    ],
  },

  recibes: {
    eyebrow: "Qué recibes",
    title: "Lo que te llevas de la sesión",
    items: [
      "Una sesión de hasta 60 minutos con un abogado laboral, por videollamada.",
      "El nombre y la cédula profesional de quien te atiende, antes de la sesión.",
      "La valoración de lo que te reclaman y de los plazos que corren.",
      "Tus opciones reales, con riesgos y costos, por escrito.",
      "Tu portal para cargar documentación y consultarla cuando quieras.",
    ],
    honestidad:
      "Lo que no vas a recibir: la promesa de un resultado. Nadie puede garantizarte el resultado de un asunto laboral, y quien lo haga no está siendo honesto contigo. Lo que sí podemos garantizar es que sabrás dónde estás parado.",
  },

  objeciones: {
    eyebrow: "Lo que suelen preguntarnos",
    title: "Dudas legítimas antes de pagar",
    items: [
      {
        objecion: "¿Y si mi caso no tiene solución?",
        respuesta:
          "Entonces te lo decimos en la sesión. Saber que conviene negociar y con qué números es información valiosa: evita gastar en un litigio que no ibas a ganar.",
      },
      {
        objecion: "Ya tengo un abogado, ¿para qué otra opinión?",
        respuesta:
          "Una segunda lectura de la demanda y de los plazos no compite con tu abogado. Muchos patrones llegan a querer entender lo que les explicaron.",
      },
      {
        objecion: "¿No sale más caro pagar una asesoría primero?",
        respuesta:
          "Si nos contratas para llevar el caso y aceptamos la representación, el importe de la asesoría se descuenta de los honorarios. En la práctica, la asesoría no te cuesta dos veces.",
      },
      {
        objecion: "Mi audiencia es en pocos días.",
        respuesta:
          "Dínoslo al agendar. Si el tiempo no alcanza para atenderte bien, te lo decimos antes de cobrarte, no después.",
      },
    ],
  },

  portal: {
    eyebrow: "Después de contratar",
    title: "Tu documentación, en un solo lugar",
    text: "Al confirmar tu pago recibes un folio. Con tu teléfono y ese folio entras a tu portal, cargas tu citatorio, tu demanda o tu documentación laboral, y la consultas cuando quieras. Nosotros la vemos ordenada antes de hablar contigo.",
    puntos: [
      "Entras con tu teléfono y tu folio: sin crear contraseñas.",
      "Aceptamos PDF, fotos del documento y archivos de Office.",
      "Puedes subir lo que te falte después, sin volver a pagar nada.",
    ],
  },

  honorarios: {
    eyebrow: "Honorarios y condiciones",
    title: "Lo que cuesta y lo que no está incluido",
    items: [
      {
        titulo: "Los dos servicios de arriba son el precio completo de la sesión",
        texto: "No hay cargos adicionales por la asesoría ni por la revisión prioritaria: lo que ves es lo que pagas.",
      },
      {
        titulo: "La representación se cotiza por separado",
        texto: "La defensa ante conciliación, las negociaciones y el litigio se presupuestan según las características del asunto, después de conocerlo. Nunca antes.",
      },
      {
        titulo: "Agendar o pagar no obliga al despacho a aceptar el asunto",
        texto: "Si no podemos atenderlo, te lo decimos antes de la sesión y te devolvemos el importe.",
      },
      {
        titulo: "Reprogramación",
        texto: "Responde el correo de confirmación con al menos 24 horas de anticipación y te damos otro horario disponible.",
      },
    ],
  },

  // El bloque de cupo sigue saliendo de la agenda real: getCupoSemana() cuenta
  // los huecos libres de verdad. No es escasez inventada.
  escasez: {
    titulo: (n: number) => (n === 1 ? "Queda 1 horario esta semana" : `Quedan ${n} horarios esta semana`),
    texto: "Los horarios se apartan al pagar y se liberan solos si alguien no completa la reserva.",
    pocos: "Últimos horarios disponibles.",
    agotado: {
      titulo: "Esta semana ya no hay horarios",
      texto: "Si tienes una fecha encima, escríbenos y vemos qué se puede hacer hoy.",
      cta: "Escribir a VERITUM",
    },
  },

  video: {
    eyebrow: "En un minuto",
    title: "Cómo atendemos un conflicto laboral",
    play: "Ver el video",
  },

  faq: {
    eyebrow: "Dudas frecuentes",
    title: "Antes de agendar",
    extra: [
      {
        id: "landing-precio",
        q: "¿Qué incluye el precio?",
        a: "La sesión completa con un abogado laboral, la valoración de la información que compartas y los siguientes pasos por escrito. Si después decides contratar la representación, se te presenta el alcance y los honorarios por separado, y el importe de la asesoría se descuenta de ellos.",
      },
      {
        id: "landing-credito",
        q: "¿Cómo se aplica el descuento de la asesoría?",
        a: "Si nos contratas para llevar el mismo asunto y el despacho acepta la representación, se descuenta el 100 % de lo que pagaste por tu asesoría de los honorarios totales, una sola vez por asunto y dentro de la vigencia que indica tu correo de confirmación.",
      },
      {
        id: "landing-patronal",
        q: "¿Atienden también a trabajadores?",
        a: "No. Trabajamos exclusivamente del lado del patrón en materia laboral. Así no hay conflicto de interés en tu asunto.",
      },
      {
        id: "landing-linea",
        q: "¿Cómo es la sesión?",
        a: "Siempre en línea, por videollamada, desde donde estés en México. Te enviamos el enlace por correo antes de tu sesión; no necesitas instalar nada.",
      },
    ],
  },

  agente: {
    title: "¿Prefieres preguntar antes?",
    text: "Nuestro asistente resuelve dudas sobre el proceso, los tiempos y lo que incluye cada servicio. No da respuestas jurídicas: para eso está la sesión con un abogado.",
    cta: "Escribir al asistente",
  },

  cierre: {
    title: "Los plazos laborales no esperan a que decidas",
    text: "Pero tampoco hace falta decidir a ciegas. Una sesión basta para saber qué te reclaman, qué está en juego y qué puedes hacer.",
    cta: "Revisar mi caso laboral",
  },

  barra: { cta: "Revisar mi caso", asistente: "Preguntar" },

  // Ventana al intentar salir. Es de AYUDA, no de retención: sin precio, sin
  // reloj y sin cupo. Solo ofrece otra vía a quien no quiere pagar todavía.
  salida: {
    eyebrow: "Antes de irte",
    title: "¿Prefieres preguntar antes de pagar?",
    text: "Si todavía no tienes claro si tu caso es para nosotros, pregúntale al asistente o lee cómo trabajamos. Sin compromiso.",
    ctaAsistente: "Preguntar al asistente",
    ctaProceso: "Ver cómo trabajamos",
    cerrar: "Seguir leyendo",
  },

  agendar: {
    eyebrow: "Reserva",
    title: "Agenda tu asesoría laboral",
    text: "Elige tu servicio y el horario que te acomode, y confirma con el pago. Recibirás el correo con tu folio y el acceso a tu portal.",
    aviso:
      "La asesoría tiene como finalidad conocer tu situación, revisar la información disponible y ofrecer una orientación preliminar. Agendar o pagar una asesoría no garantiza la aceptación del asunto ni un resultado determinado. La representación o la realización de trabajos posteriores requiere confirmación expresa del alcance y los honorarios. Si tienes una audiencia, un vencimiento o una notificación próxima, indícalo antes de reservar.",
    canceladoAviso: "El pago se canceló y el horario quedó libre. Puedes elegir otro y volver a intentarlo.",
  },

  confirmacion: {
    titleOk: "Tu asesoría está confirmada",
    textOk: "Te enviamos un correo con tu folio, la fecha y el acceso a tu portal. Si no lo ves, revisa la carpeta de no deseados.",
    titlePendiente: "Estamos confirmando tu pago",
    textPendiente: "Esto tarda unos segundos. No cierres esta página.",
    titleError: "No encontramos ese pago",
    textError: "Si el cargo aparece en tu banco, escríbenos con el folio y lo revisamos de inmediato.",
    prepararTitle: "Qué preparar",
    portalTitle: "Sube tu documentación",
    portalTexto: "Con tu teléfono y tu folio puedes entrar a tu portal y cargar lo que tengas de tu asunto.",
    portalCta: "Entrar a mi portal",
    volver: "Ir al sitio de VERITUM",
  },
} as const;
