// ============================================================================
// Servicios de la landing de defensa laboral (/consulta).
// TEXTOS PENDIENTES DE APROBACIÓN DE VERITUM.
//
// IMPORTES APROBADOS POR VERITUM (brief del cliente): $1,990 y $3,490 MXN.
//
// Los importes viven aquí y NO en variables de entorno a propósito. Las
// NEXT_PUBLIC_* se congelan en tiempo de compilación, y el Dockerfile no las
// declara todas como ARG: una variable ausente en el build deja la landing sin
// precio y sin posibilidad de reservar, y el fallo no se nota hasta que un
// cliente no puede pagar. Un literal aquí se ve en el diff.
//
// El importe realmente cobrado se re-sincroniza desde Stripe en el webhook
// (precio_centavos = coalesce(session.amount_total, …)), así que la base de
// datos nunca queda a merced de este literal.
// ============================================================================

/** Las tres situaciones en las que se concentra la comunicación. */
export const situacionValues = ["citatorio", "demanda", "terminacion"] as const;
export type SituacionId = (typeof situacionValues)[number];

export const productoValues = ["asesoria", "revision-prioritaria"] as const;
export type ProductoId = (typeof productoValues)[number];

export const MONEDA = "MXN";

export type Producto = {
  id: ProductoId;
  nombre: string;
  /** Importe en centavos. */
  precioCentavos: number;
  /** Duración de la sesión en minutos. */
  duracionMinutos: number;
  /**
   * Anticipación mínima para poder agendar este servicio, en minutos.
   * El prioritario exige 48 h porque la revisión documental no puede existir
   * sin tiempo para revisar: no es un aviso, es el calendario.
   */
  leadMinutos: number;
  resumen: string;
  incluye: readonly string[];
  /** El servicio exige que el cliente cargue documentación en el portal. */
  requiereDocumentos: boolean;
  /** Variable de entorno con el id de precio de Stripe (opcional). */
  stripePriceEnv: string;
  /** Aviso obligatorio junto al precio, si el servicio lo necesita. */
  aviso?: string;
};

export const productos: readonly Producto[] = [
  {
    id: "asesoria",
    nombre: "Asesoría laboral para patrones",
    precioCentavos: 199000,
    duracionMinutos: 60,
    leadMinutos: 120,
    resumen:
      "Sesión de hasta 60 minutos para conocer tu problema, evaluar los antecedentes iniciales, explicarte las alternativas y definir los siguientes pasos.",
    incluye: [
      "Videollamada de hasta 60 minutos con un abogado laboral.",
      "Valoración de los antecedentes que nos compartas.",
      "Explicación de tus alternativas, con sus riesgos y sus plazos.",
      "Los siguientes pasos concretos, por escrito, al terminar.",
    ],
    requiereDocumentos: false,
    stripePriceEnv: "STRIPE_PRICE_ASESORIA_ID",
  },
  {
    id: "revision-prioritaria",
    nombre: "Revisión laboral prioritaria",
    precioCentavos: 349000,
    duracionMinutos: 60,
    // 48 horas: es el tiempo que se necesita para revisar la documentación
    // antes de la sesión. Los horarios más cercanos no se ofrecen.
    leadMinutos: 48 * 60,
    resumen:
      "Revisión documental previamente delimitada y sesión de hasta 60 minutos. Para asuntos que requieren revisar una demanda, un citatorio, una notificación u otra documentación relevante.",
    incluye: [
      "Revisión de la documentación que cargues en tu portal, con alcance delimitado.",
      "Videollamada de hasta 60 minutos para explicarte lo que encontramos.",
      "Identificación de plazos y de lo que está en juego según tus documentos.",
      "Los siguientes pasos concretos, por escrito, al terminar.",
    ],
    requiereDocumentos: true,
    stripePriceEnv: "STRIPE_PRICE_REVISION_ID",
    aviso:
      "La disponibilidad del servicio prioritario se verifica antes de confirmar la atención. Se agenda con al menos 48 horas de anticipación: es el tiempo que necesitamos para revisar tu documentación antes de hablar contigo. El alcance de la revisión se delimita y se confirma por escrito antes de la sesión.",
  },
];

export const productoPorId = (id: string | undefined | null): Producto | undefined =>
  productos.find((p) => p.id === id);

/** Producto por omisión cuando no se indica ninguno. */
export const productoPorDefecto = productos[0];

export const productoODefecto = (id: string | undefined | null): Producto =>
  productoPorId(id) ?? productoPorDefecto;

/** Anticipación mínima del producto, en minutos. */
export const leadDe = (id: string | undefined | null): number => productoODefecto(id).leadMinutos;

/** El importe más bajo del catálogo, para los textos tipo "desde $1,990". */
export const precioDesde = Math.min(...productos.map((p) => p.precioCentavos));

// ---------------------------------------------------------------------------
// El argumento comercial central
// ---------------------------------------------------------------------------

export const creditoRepresentacion = {
  titulo: "Tu asesoría cuenta como parte de tu defensa",
  texto:
    "Si decides contratar a VERITUM para llevar tu caso, el importe pagado por tu asesoría se descuenta de los honorarios de representación, conforme a las condiciones de contratación.",
  ejemplo: {
    titulo: "Cómo se aplica",
    // Los importes de honorarios son un EJEMPLO ilustrativo, no una tarifa:
    // la representación se cotiza por separado según cada asunto.
    asesoriaCentavos: 199000,
    honorariosCentavos: 4500000,
    saldoCentavos: 4500000 - 199000,
    nota: "Los honorarios de representación de este ejemplo son ilustrativos: se cotizan por separado según las características de cada asunto.",
  },
  condiciones: [
    "Aplica al mismo asunto por el que pagaste la asesoría.",
    "Aplica cuando el despacho acepta la representación; puede no aceptarla.",
    "Se descuenta el 100 % del importe pagado, una sola vez por asunto.",
    "Tiene una vigencia a partir del pago, indicada en tu correo de confirmación.",
  ],
} as const;

// ---------------------------------------------------------------------------
// Las tres situaciones
// ---------------------------------------------------------------------------

export const situaciones: readonly {
  id: SituacionId;
  titulo: string;
  texto: string;
  queHacemos: readonly string[];
  /** Servicio que se sugiere por omisión para esta situación. */
  productoSugerido: ProductoId;
}[] = [
  {
    id: "citatorio",
    titulo: "Recibí un citatorio de conciliación",
    texto:
      "Te citaron al Centro de Conciliación y hay una fecha que ya corre. Lo que se diga y lo que se firme en esa audiencia condiciona todo lo que venga después.",
    queHacemos: [
      "Revisamos el citatorio y la fecha real de la audiencia.",
      "Valoramos la contingencia antes de que ofrezcas o firmes nada.",
      "Definimos qué conviene proponer y hasta dónde.",
    ],
    productoSugerido: "revision-prioritaria",
  },
  {
    id: "demanda",
    titulo: "Recibí una demanda o una notificación laboral",
    texto:
      "Hay un plazo para contestar y perderlo tiene consecuencias. Necesitas saber qué te reclaman, cuánto puede costar y con qué cuentas para defenderte.",
    queHacemos: [
      "Leemos la demanda y lo que efectivamente te reclaman.",
      "Identificamos los plazos que están corriendo.",
      "Revisamos qué documentación sostiene tu posición y qué falta.",
    ],
    productoSugerido: "revision-prioritaria",
  },
  {
    id: "terminacion",
    titulo: "Necesito terminar una relación laboral o negociar una salida",
    texto:
      "Todavía no hay conflicto y ese es el mejor momento. Una terminación bien documentada es la diferencia entre cerrar un tema y heredar una demanda.",
    queHacemos: [
      "Revisamos la situación del trabajador y tu documentación laboral.",
      "Calculamos lo que corresponde y lo que se está reclamando de más.",
      "Definimos cómo documentar la salida para que cierre de verdad.",
    ],
    productoSugerido: "asesoria",
  },
];

export const situacionPorId = (id: string | undefined | null) =>
  situaciones.find((s) => s.id === id);

export const situacionLabel = (id: string | undefined | null): string | undefined =>
  situacionPorId(id)?.titulo;

/** Vigencia del crédito en días. Se fija al pagar, no se recalcula al leer. */
export const creditoVigenciaDias = Math.max(
  1,
  Number(process.env.CREDITO_VIGENCIA_DIAS ?? 90) || 90,
);
