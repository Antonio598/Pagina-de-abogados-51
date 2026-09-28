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

/**
 * Fundamento legal de una sección. `version` es la fecha de la última reforma
 * del texto que se consultó: sirve para saber si una cita envejeció.
 */
export type Fuente = { ley: string; articulos: string; version: string };

export type ArticleSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  /** Preceptos en los que se apoya la sección. */
  fuentes?: Fuente[];
};

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
      "El derecho a alimentos nace de la filiación, no del matrimonio.",
      "Qué cubre la pensión y cómo se fija su monto.",
      "Qué reunir antes de una revisión; no existe procedencia automática.",
    ],
    cta: { label: "Agenda una revisión", kind: "agenda" },
    serviceSlug: "derecho-familiar",
    formType: "familiar",
    faqIds: ["primera-llamada", "documentos", "garantia"],
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-27",
    author: "VERITUM",
    readingMinutes: 6,
    body: [
      {
        heading: "El matrimonio no es lo que crea el derecho a alimentos",
        paragraphs: [
          "Es una de las confusiones más frecuentes: que sin matrimonio no hay pensión. No es así. La obligación de dar alimentos a un hijo nace de la relación de parentesco, no del estado civil de los padres. La ley lo dice de forma directa: los padres están obligados a dar alimentos a sus hijos.",
          "Lo que sí cambia sin matrimonio es cómo se acredita quién es el padre. Respecto de la madre, la filiación de un hijo nacido fuera de matrimonio resulta del solo hecho del nacimiento. Respecto del padre, se establece por reconocimiento voluntario o por una sentencia que declare la paternidad. Ese es el punto donde suele estar el trabajo real del asunto.",
        ],
        fuentes: [
          { ley: "Código Civil Federal", articulos: "artículos 303 y 360", version: "14 de noviembre de 2025" },
        ],
      },
      {
        heading: "Qué comprende la pensión",
        paragraphs: [
          "Alimentos no significa solo comida. La ley enumera qué incluye, y para menores de edad añade expresamente los gastos de educación y los necesarios para proporcionarle un oficio, arte o profesión.",
        ],
        list: [
          "Comida.",
          "Vestido.",
          "Habitación.",
          "Asistencia en casos de enfermedad.",
          "Para menores: además, los gastos de su educación y de su formación para un oficio o profesión.",
        ],
        fuentes: [{ ley: "Código Civil Federal", articulos: "artículo 308", version: "14 de noviembre de 2025" }],
      },
      {
        heading: "Cómo se fija el monto: proporcionalidad, no un porcentaje fijo",
        paragraphs: [
          "No existe un porcentaje automático. Los alimentos han de ser proporcionados a las posibilidades de quien debe darlos y a las necesidades de quien debe recibirlos. Esas dos variables son las que se discuten, y las que hay que documentar.",
          "Un detalle que casi nadie tiene presente: cuando el monto queda fijado por convenio o por sentencia, la ley prevé un incremento automático anual, salvo que el deudor demuestre que sus ingresos no aumentaron en la misma proporción. Conviene que eso quede expresado en el documento, porque la propia ley ordena que se exprese.",
        ],
        fuentes: [{ ley: "Código Civil Federal", articulos: "artículo 311", version: "14 de noviembre de 2025" }],
      },
      {
        heading: "El pago puede asegurarse",
        paragraphs: [
          "Si la preocupación es que la pensión se fije y luego no se pague, la ley contempla que se garantice. El aseguramiento puede consistir en hipoteca, prenda, fianza, depósito de una cantidad suficiente o cualquier otra garantía que el juez considere bastante.",
        ],
        fuentes: [{ ley: "Código Civil Federal", articulos: "artículo 317", version: "14 de noviembre de 2025" }],
      },
      {
        heading: "Qué reunir antes de una revisión",
        list: [
          "Acta de nacimiento del menor.",
          "Identificación oficial de quien promueve.",
          "Cualquier prueba del reconocimiento, si existe: acta, escrito, mensajes.",
          "Lo que se sepa de los ingresos del obligado: recibos, nombre del empleador, actividad.",
          "Comprobantes de los gastos del menor: colegiatura, salud, vivienda.",
          "Convenios o resoluciones previas, si ya hubo un juicio.",
        ],
      },
      {
        heading: "Una advertencia necesaria sobre la ley aplicable",
        paragraphs: [
          "Las citas de este artículo son del Código Civil Federal. En México la materia familiar está regulada principalmente por el código civil o familiar de cada entidad, y los montos, los plazos y los procedimientos cambian de un estado a otro. Lo que aquí se explica sirve para entender el marco, no para sustituir la revisión de tu caso conforme al código de tu entidad.",
          "Este artículo es información general y no constituye asesoría legal. No promete ningún resultado: cada asunto depende de sus pruebas y de sus circunstancias.",
        ],
      },
    ],
  },

  {
    slug: "citatorio-conciliacion-patron",
    title: "Recibí un citatorio de conciliación laboral: qué hacer",
    homeTitle: "Qué hacer con un citatorio de conciliación",
    kind: "Guía",
    categories: ["Trabajo y relaciones laborales", "Prevención legal para empresas"],
    topics: [
      "La conciliación prejudicial es obligatoria antes del juicio.",
      "Los plazos que corren y la multa por no comparecer.",
      "Por qué tu documentación decide el resultado antes de la audiencia.",
    ],
    cta: { label: "Revisar mi caso laboral", kind: "agenda" },
    serviceSlug: "derecho-laboral",
    formType: "laboral",
    faqIds: ["urgencias", "documentos", "garantia"],
    publishedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    author: "VERITUM",
    readingMinutes: 7,
    body: [
      {
        heading: "Qué es ese citatorio y por qué no es opcional",
        paragraphs: [
          "Desde la reforma laboral, antes de acudir a los tribunales trabajadores y patrones deben asistir al Centro de Conciliación correspondiente para solicitar el inicio del procedimiento de conciliación. Salvo los supuestos que la propia ley exime, es un paso obligatorio: no es una invitación a negociar, es la puerta de entrada del conflicto.",
          "Eso tiene una lectura favorable para el patrón: hay una oportunidad real de cerrar el asunto antes de un juicio, y con costos previsibles. Y una desfavorable: si se llega sin haber valorado la contingencia, se negocia a ciegas.",
        ],
        fuentes: [
          { ley: "Ley Federal del Trabajo", articulos: "artículos 684-A y 684-B", version: "14 de mayo de 2026" },
        ],
      },
      {
        heading: "Los plazos que ya están corriendo",
        list: [
          "La audiencia de conciliación se señala dentro de los quince días siguientes a la solicitud.",
          "El citatorio se notifica personalmente al patrón con al menos cinco días de anticipación a la audiencia.",
          "Todo el procedimiento de conciliación no debe exceder de cuarenta y cinco días naturales.",
          "Si ambas partes acuden juntas a presentar la solicitud, la audiencia puede celebrarse dentro de los cinco días siguientes, o incluso en ese mismo momento.",
        ],
        paragraphs: [
          "Traducido: desde que te notifican, el tiempo útil para revisar documentos y decidir una postura se mide en días, no en semanas.",
        ],
        fuentes: [
          {
            ley: "Ley Federal del Trabajo",
            articulos: "artículos 684-D y 684-E, fracciones IV y VI",
            version: "14 de mayo de 2026",
          },
        ],
      },
      {
        heading: "No comparecer tiene un costo concreto",
        paragraphs: [
          "Es el error más caro y el más fácil de evitar. La ley advierte al patrón que, de no comparecer por sí, por conducto de su representante legal o por apoderado con facultades suficientes, se le impondrá una multa de entre 50 y 100 veces la Unidad de Medida y Actualización, y —esto es lo importante— se le tendrá por inconforme con todo arreglo conciliatorio.",
          "Además, quien asista debe poder obligarse: el patrón debe comparecer personalmente o por medio de representante con facultades suficientes para obligarse en su nombre. Mandar a alguien sin poderes equivale, en la práctica, a no asistir.",
        ],
        fuentes: [
          {
            ley: "Ley Federal del Trabajo",
            articulos: "artículo 684-E, fracciones IV y VII",
            version: "14 de mayo de 2026",
          },
        ],
      },
      {
        heading: "Tu documentación decide el caso antes de la audiencia",
        paragraphs: [
          "Esta es la parte que más patrones descubren tarde. La ley obliga al patrón a conservar y exhibir en juicio determinados documentos, y establece la consecuencia de no hacerlo: se presumen ciertos los hechos que el trabajador afirme en relación con esos documentos, salvo prueba en contrario.",
          "Es decir, la falta de un control de asistencia o de recibos de nómina no es un descuido administrativo: desplaza la carga de la prueba en tu contra sobre ese hecho.",
        ],
        list: [
          "Contratos individuales de trabajo, cuando no haya contrato colectivo o contrato ley aplicable.",
          "Listas de raya o nómina, o recibos de pago de salarios.",
          "Controles de asistencia, cuando se lleven en el centro de trabajo.",
          "Comprobantes de pago de utilidades, vacaciones, aguinaldo y primas, y de aportaciones y cuotas de seguridad social.",
        ],
        fuentes: [
          { ley: "Ley Federal del Trabajo", articulos: "artículos 804 y 805", version: "14 de mayo de 2026" },
        ],
      },
      {
        heading: "Cuánto tiempo hay que guardar cada cosa",
        paragraphs: [
          "La propia ley fija los plazos de conservación, y son más cortos de lo que muchos suponen: los contratos, mientras dure la relación laboral y hasta un año después; las nóminas, los controles de asistencia y los comprobantes de prestaciones, durante el último año y un año después de que se extinga la relación.",
        ],
        fuentes: [
          { ley: "Ley Federal del Trabajo", articulos: "artículo 804, último párrafo", version: "14 de mayo de 2026" },
        ],
      },
      {
        heading: "Si el asunto viene de un despido, revisa el aviso",
        paragraphs: [
          "Cuando el patrón despide a un trabajador debe darle aviso escrito señalando con claridad la conducta o conductas que motivan la rescisión y las fechas en que se cometieron. El aviso se entrega personalmente al trabajador en el momento del despido o se comunica al Tribunal competente dentro de los cinco días hábiles siguientes.",
          "La consecuencia de omitirlo está escrita en la ley y conviene leerla dos veces: la falta de aviso, por sí sola, presume la separación no justificada, salvo prueba en contrario. Y la prescripción para que el trabajador ejerza sus acciones por despido no empieza a correr hasta que recibe personalmente ese aviso.",
        ],
        fuentes: [
          { ley: "Ley Federal del Trabajo", articulos: "artículo 47, párrafos finales", version: "14 de mayo de 2026" },
        ],
      },
      {
        heading: "Qué reunir antes de tu sesión",
        list: [
          "El citatorio completo, con todas sus páginas y sellos, y el acuse de cuándo te lo entregaron.",
          "Contrato de trabajo, recibos de nómina recientes y alta y movimientos ante el IMSS.",
          "El aviso de rescisión, la renuncia o el convenio, si existen.",
          "Control de asistencia, vacaciones y comprobantes de aguinaldo y primas.",
          "Comunicaciones con el trabajador relacionadas con la salida.",
        ],
        paragraphs: [
          "Este artículo es información general y no constituye asesoría legal. No promete ningún resultado: la valoración depende de tus documentos y de las circunstancias del caso.",
        ],
      },
    ],
  },

  {
    slug: "terminacion-trabajador",
    title: "Terminó tu relación de trabajo: qué te corresponde",
    homeTitle: "Qué te corresponde al salir de un trabajo",
    kind: "Guía",
    categories: ["Trabajo y relaciones laborales"],
    topics: [
      "Qué se paga siempre y qué solo si el despido fue injustificado.",
      "Las cuentas: veinte días por año, tres meses, aguinaldo y vacaciones.",
      "Los plazos para reclamar, que son cortos.",
    ],
    cta: { label: "Agenda una revisión", kind: "agenda" },
    serviceSlug: "asesoria-empresas",
    formType: "empresa",
    faqIds: ["primera-llamada", "documentos", "garantia"],
    publishedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    author: "VERITUM",
    readingMinutes: 7,
    body: [
      {
        heading: "Primero: lo que se paga siempre",
        paragraphs: [
          "Al terminar la relación de trabajo, por cualquier causa, hay conceptos que corresponden por el simple hecho de haber trabajado. No dependen de que el despido haya sido justificado o no.",
        ],
        list: [
          "Aguinaldo: al menos quince días de salario, y debe pagarse antes del 20 de diciembre; si sales antes, la parte proporcional al tiempo trabajado.",
          "Vacaciones: quien tiene más de un año de servicios disfruta de un periodo anual que en ningún caso puede ser inferior a doce días laborables, y aumenta dos días por cada año siguiente hasta llegar a veinte.",
          "Prima vacacional: una prima no menor al veinticinco por ciento sobre los salarios del periodo de vacaciones.",
          "Salarios devengados y no pagados.",
        ],
        fuentes: [
          { ley: "Ley Federal del Trabajo", articulos: "artículos 76, 80 y 87", version: "14 de mayo de 2026" },
        ],
      },
      {
        heading: "Después: lo que se paga si el despido fue injustificado",
        paragraphs: [
          "Aquí está la diferencia grande. Si el despido fue injustificado, puedes pedir que te reinstalen en el trabajo que desempeñabas o que te indemnicen con el importe de tres meses de salario. Es tu elección, no del patrón.",
          "Y si el patrón no comprueba en juicio la causa de la rescisión, además tienes derecho al pago de los salarios vencidos desde la fecha del despido, hasta por un periodo máximo de doce meses. Si al término de ese plazo el procedimiento no concluyó o no se cumplió la sentencia, se pagan además intereses sobre el importe de quince meses de salario, al dos por ciento mensual.",
        ],
        fuentes: [{ ley: "Ley Federal del Trabajo", articulos: "artículo 48", version: "14 de mayo de 2026" }],
      },
      {
        heading: "La cuenta de la indemnización",
        paragraphs: [
          "Cuando la relación era por tiempo indeterminado, la indemnización consiste en veinte días de salario por cada año de servicios prestados. A eso se suma el importe de tres meses de salario y, en su caso, los salarios vencidos e intereses.",
          "Si la relación era por tiempo determinado, la regla cambia: menor de un año, el importe de los salarios de la mitad del tiempo trabajado; si excedía de un año, seis meses por el primer año y veinte días por cada uno de los siguientes.",
        ],
        fuentes: [
          {
            ley: "Ley Federal del Trabajo",
            articulos: "artículo 50, fracciones I a III",
            version: "14 de mayo de 2026",
          },
        ],
      },
      {
        heading: "Los plazos son cortos: esto es lo más urgente del artículo",
        paragraphs: [
          "Las acciones de trabajo prescriben en un año, contado a partir del día siguiente a la fecha en que la obligación sea exigible. Pero hay una excepción que se pasa por alto y que cuesta casos completos: las acciones de los trabajadores separados del trabajo prescriben en dos meses.",
          "Dos meses. Si te despidieron, ese es el reloj que corre para reclamar el despido. Un dato a tu favor: la prescripción para ejercer las acciones derivadas del despido no empieza a correr hasta que recibes personalmente el aviso de rescisión, así que si nunca te lo entregaron, conviene revisarlo con un abogado antes de dar el plazo por perdido.",
        ],
        fuentes: [
          {
            ley: "Ley Federal del Trabajo",
            articulos: "artículos 516, 518 y 47, penúltimo párrafo",
            version: "14 de mayo de 2026",
          },
        ],
      },
      {
        heading: "Antes del juicio hay una conciliación obligatoria",
        paragraphs: [
          "No se va directo al tribunal. Antes de acudir a los tribunales, trabajadores y patrones deben asistir al Centro de Conciliación para solicitar el inicio del procedimiento de conciliación, salvo los supuestos que la ley exime. El procedimiento no debe exceder de cuarenta y cinco días naturales.",
          "Los Centros de Conciliación deben proporcionar asesoría jurídica gratuita sobre tus derechos y sobre los plazos de prescripción, y pueden auxiliarte a elaborar tu solicitud. Puedes acudir acompañado por una persona de tu confianza y asistido por un abogado o por un Procurador de la Defensa del Trabajo.",
        ],
        fuentes: [
          {
            ley: "Ley Federal del Trabajo",
            articulos: "artículos 684-B, 684-D y 684-E, fracciones III y VII",
            version: "14 de mayo de 2026",
          },
        ],
      },
      {
        heading: "Si ya firmaste algo",
        paragraphs: [
          "Firmar una renuncia o un convenio no cierra automáticamente la puerta, pero cambia el terreno y el trabajo que hay que hacer. Lo que importa es en qué circunstancias se firmó, qué dice exactamente el documento y si los conceptos pagados coinciden con lo que correspondía. Llévalo a la revisión: es el documento más importante que puedes traer.",
        ],
      },
      {
        heading: "Qué reunir antes de tu sesión",
        list: [
          "Contrato de trabajo, si lo tienes.",
          "Recibos de nómina de los últimos meses.",
          "Tu alta y movimientos ante el IMSS.",
          "Fecha de ingreso y de salida, y tu salario real, incluyendo lo que no iba en nómina.",
          "La renuncia, el convenio o el recibo de liquidación que hayas firmado.",
          "Mensajes o correos relacionados con tu salida.",
        ],
        paragraphs: [
          "Este artículo es información general y no constituye asesoría legal. No promete ningún resultado: cada asunto depende de sus pruebas y de sus circunstancias. Atendemos este servicio del lado de la persona trabajadora; si ya asesoramos a tu contraparte en el mismo asunto, te lo diremos antes de aceptar el caso.",
        ],
      },
    ],
  },

  {
    slug: "revisar-contrato-antes-de-firmar",
    title: "Cómo revisar un contrato antes de firmarlo",
    homeTitle: "Qué revisar antes de firmar un contrato",
    kind: "Checklist",
    categories: ["Contratos y obligaciones", "Guías y listas de verificación"],
    topics: [
      "Los dos elementos sin los que el contrato no existe.",
      "Error, dolo y violencia: cuándo el consentimiento no vale.",
      "Lo que la ley da por puesto aunque no lo escribas.",
    ],
    cta: { label: "Agenda una revisión", kind: "agenda" },
    serviceSlug: "derecho-civil-contratos",
    formType: "civil",
    faqIds: ["primera-llamada", "documentos", "relacion"],
    publishedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    author: "VERITUM",
    readingMinutes: 6,
    body: [
      {
        heading: "Sin estas dos cosas no hay contrato",
        paragraphs: [
          "La ley distingue entre un contrato que no existe y uno que existe pero puede invalidarse. Para la existencia del contrato se requieren consentimiento y un objeto que pueda ser materia del contrato. Si falta alguno, el acto no produce efecto legal alguno, no se puede confirmar ni sanar con el tiempo, y cualquier interesado puede invocar su inexistencia.",
          "Por eso la primera pregunta al revisar un contrato no es si las cláusulas convienen, sino si está claro sobre qué se está contratando exactamente.",
        ],
        fuentes: [
          { ley: "Código Civil Federal", articulos: "artículos 1794 y 2224", version: "14 de noviembre de 2025" },
        ],
      },
      {
        heading: "Cuándo el consentimiento no vale",
        paragraphs: [
          "El consentimiento no es válido si se dio por error, se arrancó por violencia o se obtuvo con dolo. Estas tres palabras tienen un significado técnico preciso que conviene conocer antes de firmar.",
        ],
        list: [
          "Error: invalida el contrato cuando recae sobre el motivo determinante de la voluntad, si ese motivo se declaró al celebrarlo o se prueba por las circunstancias del propio contrato.",
          "Dolo: cualquier sugestión o artificio empleado para inducir a error o mantener en él a una de las partes. Anula el contrato si fue la causa determinante del acto.",
          "Mala fe: disimular el error de la otra parte una vez conocido.",
          "Violencia: fuerza física o amenazas que impliquen peligro de perder la vida, la honra, la libertad, la salud o una parte considerable de los bienes, propios o de parientes cercanos.",
        ],
        fuentes: [
          {
            ley: "Código Civil Federal",
            articulos: "artículos 1812, 1813, 1815, 1816 y 1819",
            version: "14 de noviembre de 2025",
          },
        ],
      },
      {
        heading: "Ojo: ratificar después borra el vicio",
        paragraphs: [
          "Un punto práctico que cambia decisiones. Si cesó la violencia o ya conoces el engaño y aun así ratificas el contrato, no puedes después reclamar por esos mismos vicios. En la práctica: si descubres algo grave, no sigas ejecutando el contrato como si nada mientras decides; consúltalo primero.",
        ],
        fuentes: [{ ley: "Código Civil Federal", articulos: "artículo 1823", version: "14 de noviembre de 2025" }],
      },
      {
        heading: "Lo que la ley da por puesto aunque no lo escribas",
        paragraphs: [
          "Las partes pueden poner las cláusulas que consideren convenientes. Pero las que se refieren a los requisitos esenciales del contrato, o las que son consecuencia de su naturaleza ordinaria, se tienen por puestas aunque no se expresen, salvo que estas últimas se renuncien en los casos y términos que la ley permite.",
          "Eso significa dos cosas al revisar: no todo lo que falta está ausente, y no toda renuncia escrita es válida. Las dos merecen una lectura profesional.",
        ],
        fuentes: [{ ley: "Código Civil Federal", articulos: "artículo 1839", version: "14 de noviembre de 2025" }],
      },
      {
        heading: "Cómo se va a leer tu contrato si hay conflicto",
        paragraphs: [
          "Si los términos son claros y no dejan duda sobre la intención de las partes, se estará al sentido literal de las cláusulas. Es la razón por la que la redacción importa más que la intención: en un conflicto, lo que quisiste decir cede ante lo que escribiste.",
        ],
        fuentes: [{ ley: "Código Civil Federal", articulos: "artículo 1851", version: "14 de noviembre de 2025" }],
      },
      {
        heading: "Lista de verificación antes de firmar",
        list: [
          "¿Están identificadas correctamente las partes, con facultades de quien firma en nombre de una empresa?",
          "¿Está descrito el objeto con precisión: qué, cuánto, en qué plazo y con qué estándar?",
          "¿Cómo, cuándo y contra qué se paga? ¿Qué pasa si hay retraso?",
          "¿Qué obligaciones quedan a cargo de cada parte, y qué pasa si una no cumple?",
          "¿Hay alguna renuncia de derechos? ¿Es una de las que la ley permite renunciar?",
          "¿Cómo termina el contrato, y qué queda vivo después de que termine?",
          "¿Qué ley aplica y ante quién se resuelven las controversias?",
          "¿Coincide lo escrito con lo que te dijeron de palabra? Si no, ese es el punto a discutir antes de firmar.",
        ],
        paragraphs: [
          "Las citas de este artículo son del Código Civil Federal. En materia civil cada entidad tiene su propio código y las reglas pueden variar, así que conviene revisar el contrato conforme a la legislación aplicable al caso. Este artículo es información general y no constituye asesoría legal.",
        ],
      },
    ],
  },
];

export const getResource = (slug: string) => resources.find((r) => r.slug === slug);

export const resourceHref = (r: LibraryResource) => {
  if (r.cta.kind === "agenda") return `/agenda?tipo=${r.formType}`;
  if (r.cta.kind === "download" && r.downloadUrl) return r.downloadUrl;
  return `/contacto?asunto=${r.formType}&recurso=${r.slug}`;
};
