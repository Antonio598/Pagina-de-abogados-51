// ============================================================================
// Avisos legales de VERITUM.
//
// BORRADOR REDACTADO POR EL SISTEMA, PENDIENTE DE APROBACIÓN DEL DESPACHO.
//
// El texto describe lo que esta aplicación hace DE VERDAD: cada dato, cada
// cookie y cada proveedor mencionado aquí está comprobado contra el código y
// contra supabase/schema.sql. Lo que no puede comprobarse desde el código —los
// plazos de conservación y las obligaciones profesionales— va escrito como
// propuesta y es decisión del despacho.
//
// SI CAMBIA EL TRATAMIENTO (un proveedor nuevo, un dato nuevo, una finalidad
// nueva), ESTE ARCHIVO SE ACTUALIZA Y SE CAMBIA `ACTUALIZADO`. Un aviso que no
// describe el tratamiento real no protege a nadie, y es peor que no tenerlo.
// ============================================================================

export type LegalBlock = {
  heading: string;
  paragraphs: string[];
  /** Lista que se pinta a continuación de los párrafos. */
  list?: string[];
};

export type LegalDoc = {
  slug: string;
  title: string;
  body?: LegalBlock[];
  /** Índice de respaldo mientras no hay texto. Con `body`, el índice sale de sus encabezados. */
  sections?: string[];
  updatedAt?: string;
};

const RESPONSABLE = "Miguel Ángel Martínez Colunga";
const DOMICILIO =
  "Circunvalación Poniente No. 1, oficina 303, Ciudad Satélite, Naucalpan de Juárez, Estado de México, C.P. 53100";
const CORREO = "contacto@veritum.com.mx";
const ACTUALIZADO = "2026-10-26";

export const legalDocs: LegalDoc[] = [
  // ==========================================================================
  // AVISO DE PRIVACIDAD
  // ==========================================================================
  {
    slug: "aviso-de-privacidad",
    title: "Aviso de privacidad",
    updatedAt: ACTUALIZADO,
    body: [
      {
        heading: "Identidad y domicilio del responsable",
        paragraphs: [
          `${RESPONSABLE}, persona física que ejerce la abogacía bajo la denominación comercial VERITUM · Capital Humano & Legal (en adelante, VERITUM), es el responsable del tratamiento de tus datos personales.`,
          `Domicilio: ${DOMICILIO}.`,
          `Correo para todo lo relacionado con datos personales: ${CORREO}.`,
          "Este aviso se emite conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y los Lineamientos del Aviso de Privacidad. Describe el tratamiento que realizan este sitio y las herramientas que lo acompañan.",
        ],
      },
      {
        heading: "Datos personales que recabamos y para qué",
        paragraphs: [
          "Recabamos únicamente los datos que tú nos proporcionas y los que genera tu navegación. No compramos bases de datos ni obtenemos tus datos de terceros.",
          "Cuando agendas una asesoría o nos escribes por el formulario de contacto tratamos: nombre, correo electrónico, teléfono, entidad federativa, municipio, el tipo de asunto, la descripción del caso que decidas escribir, la situación en la que te encuentras, el horario elegido y, en su caso, una fecha relevante de tu asunto.",
          "Si contratas, tratamos además el folio de tu cita, el importe, el identificador del pago y las notas de avance de tu expediente. Si tu servicio incluye revisión documental, tratamos los archivos que cargues en el portal del cliente.",
          "De tu navegación registramos un identificador de sesión temporal, la página visitada, el dominio desde el que llegaste, el tipo de dispositivo, los parámetros de campaña (UTM) y el tiempo de permanencia. Ese registro no incluye tu dirección IP y no permite identificarte.",
        ],
        list: [
          "Finalidades primarias, necesarias para el servicio: atender tu solicitud; agendar, confirmar y en su caso reprogramar o cancelar tu sesión; prestar la asesoría o la revisión documental contratada; integrar y dar seguimiento a tu expediente; procesar el pago y emitir comprobantes; comunicarnos contigo sobre tu asunto; y cumplir obligaciones legales, fiscales y profesionales.",
          "Finalidades secundarias, que no son necesarias: medir el desempeño de este sitio y de nuestras campañas, y enviarte comunicaciones informativas sobre temas jurídicos de tu interés.",
          `Para negarte a las finalidades secundarias basta con que nos escribas a ${CORREO} indicando que no las autorizas. Tu negativa no es motivo para negarte el servicio y no afecta en nada la atención de tu asunto.`,
        ],
      },
      {
        heading: "Datos personales sensibles",
        paragraphs: [
          "Por la naturaleza de la materia laboral, los documentos que cargues en el portal del cliente pueden contener datos personales sensibles, tuyos o de terceros: por ejemplo datos de salud (incapacidades, dictámenes de riesgo de trabajo) o la afiliación sindical de un trabajador. La LFPDPPP considera sensibles esos datos y exige consentimiento expreso para tratarlos.",
          "Al marcar la casilla de aceptación de este aviso antes de contratar, y al cargar documentación en el portal, otorgas tu consentimiento expreso para que tratemos los datos sensibles que esa documentación contenga, con la única finalidad de analizar tu asunto y prestarte el servicio contratado.",
          "Te pedimos que no cargues documentos ajenos a tu asunto, y que omitas o cubras los datos sensibles que no sean necesarios para la revisión. Cuantos menos datos sensibles tratemos, mejor protegidos están.",
          "No utilizamos datos sensibles para ninguna finalidad secundaria, no los transferimos con fines comerciales y no los sometemos a decisiones automatizadas.",
        ],
      },
      {
        heading: "Cómo ejercer tus derechos ARCO y revocar el consentimiento",
        paragraphs: [
          "Tienes derecho a acceder a tus datos personales, a rectificarlos cuando sean inexactos o incompletos, a cancelarlos cuando consideres que no se requieren para alguna de las finalidades de este aviso y a oponerte a su tratamiento por una causa legítima. También puedes revocar en cualquier momento el consentimiento que nos hayas otorgado.",
          `Para ejercerlos, envía tu solicitud a ${CORREO} con el asunto "Derechos ARCO", acompañada de lo siguiente:`,
        ],
        list: [
          "Tu nombre y un medio para comunicarte la respuesta.",
          "Copia de una identificación oficial vigente que acredite tu identidad. Si actúas por medio de representante, el documento que acredite la representación.",
          "La descripción clara y precisa de los datos respecto de los que ejerces el derecho, y de cuál de los derechos quieres ejercer.",
          "Cualquier elemento que facilite localizar tus datos: tu folio de cita, el teléfono con el que agendaste o la fecha de tu sesión.",
          "Si pides rectificación, el dato correcto y la documentación que lo sustente.",
        ],
      },
      {
        heading: "Plazos de respuesta y recurso ante el INAI",
        paragraphs: [
          "Responderemos tu solicitud en un plazo máximo de veinte días hábiles contados desde que la recibamos y, de resultar procedente, la haremos efectiva dentro de los quince días hábiles siguientes. Si necesitamos información adicional para localizar tus datos, te la solicitaremos dentro de los cinco días hábiles siguientes a la recepción.",
          "La cancelación o la oposición pueden no proceder cuando debamos conservar tus datos para cumplir una obligación legal, fiscal o profesional, o cuando sean necesarios para la defensa de un asunto en curso. En ese caso te explicaremos por escrito el motivo y el plazo durante el cual seguirán bajo resguardo.",
          "Si no quedas conforme con nuestra respuesta, o si no respondemos dentro del plazo, puedes iniciar un procedimiento de protección de derechos ante el Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI), dentro de los quince días hábiles siguientes.",
        ],
      },
      {
        heading: "Proveedores que tratan datos por nuestra cuenta",
        paragraphs: [
          "Para operar utilizamos proveedores que tratan datos siguiendo nuestras instrucciones y para las finalidades de este aviso. Conforme al Reglamento de la LFPDPPP, poner datos a disposición de un encargado no constituye una transferencia y no requiere tu consentimiento; aun así te decimos quiénes son, porque tienes derecho a saberlo.",
        ],
        list: [
          "Stripe, Inc. — procesa el cobro. Recibe tu correo electrónico y el importe. Opera desde los Estados Unidos de América.",
          "Resend — envía los correos de confirmación y de seguimiento de tu cita. Recibe tu correo electrónico y el contenido del mensaje.",
          "Nuestro proveedor de infraestructura — aloja el sitio y la base de datos en la que se guardan tu expediente y tus documentos.",
          "Nuestro proveedor de automatización de mensajería — recibe tu número de teléfono y la hora de tu último contacto, con la única finalidad de enviarte recordatorios cuando una conversación queda sin respuesta.",
          "Google (Tag Manager y Analytics) y Meta — solo si aceptas las cookies correspondientes, y únicamente con datos de navegación. Nunca les enviamos tu nombre, tu correo, tu teléfono ni la descripción de tu caso.",
        ],
      },
      {
        heading: "Transferencias a terceros",
        paragraphs: [
          "No vendemos, rentamos ni compartimos tus datos personales con terceros para fines comerciales o publicitarios. Nunca.",
          "Podemos transferir tus datos sin requerir tu consentimiento únicamente en los supuestos del artículo 37 de la LFPDPPP: cuando lo exija una ley o un tratado del que México sea parte; cuando lo requiera una autoridad competente; cuando sea necesario para el reconocimiento, ejercicio o defensa de un derecho en un proceso judicial; o cuando sea necesario para el cumplimiento del contrato celebrado contigo.",
          "Si en el futuro necesitáramos transferir tus datos a un tercero para una finalidad distinta de las previstas en este aviso, te lo informaríamos y te pediríamos tu consentimiento antes de hacerlo.",
        ],
      },
      {
        heading: "Cookies y almacenamiento del navegador",
        paragraphs: [
          "Este sitio usa cookies y almacenamiento del navegador. Las estrictamente necesarias se instalan sin consentimiento, porque sin ellas el sitio no funciona. Las de analítica y publicidad solo se cargan si las aceptas en el aviso que aparece al entrar, y puedes rechazarlas o cambiar tu decisión cuando quieras.",
        ],
        list: [
          "veritum_portal — cookie de sesión del portal del cliente. Necesaria para mantener tu acceso. Se elimina al cerrar sesión.",
          "veritum_panel — cookie de sesión del panel interno. Solo la reciben las personas del despacho.",
          "veritum_promo — cookie firmada que controla la vigencia de un precio promocional. No te identifica.",
          "veritum_consent_v1 — guarda en tu navegador la decisión que tomaste sobre las cookies, para no volver a preguntarte.",
          "veritum_sid y veritum_utm — viven en el almacenamiento de sesión del navegador y desaparecen al cerrar la pestaña. Sirven para contar visitas y saber de qué campaña llegaste.",
          "Google Tag Manager, Google Analytics y Meta — solo con tu consentimiento. Si lo niegas, ninguna de esas etiquetas llega a cargarse.",
        ],
      },
      {
        heading: "Medición propia, sin cookies y sin identificarte",
        paragraphs: [
          "Además de lo anterior llevamos un conteo propio de visitas que no usa cookies y no guarda tu dirección IP. Registra un identificador aleatorio que vive solo mientras la pestaña está abierta, la página visitada, el dominio desde el que llegaste, si entras desde móvil, tableta o escritorio, los parámetros de campaña y el tiempo de permanencia.",
          "Ese registro no permite identificarte ni reconstruir tu navegación entre sesiones, y no se comparte con nadie. Lo usamos para saber qué páginas sirven y cuáles no.",
        ],
      },
      {
        heading: "Menores de edad y datos de terceros",
        paragraphs: [
          "Nuestros servicios están dirigidos a personas mayores de edad. No recabamos de forma consciente datos de menores a través de este sitio. Si tu asunto involucra a un menor, trátalo durante la sesión con el abogado y no a través de los formularios.",
          "Si nos proporcionas datos personales de terceros —por ejemplo los de tus trabajadores, al cargar nóminas, contratos o una demanda—, manifiestas que cuentas con la facultad para hacerlo y que has cumplido frente a esas personas el deber de informarles sobre el tratamiento de sus datos. VERITUM tratará esos datos únicamente para analizar y atender tu asunto.",
        ],
      },
      {
        heading: "Cuánto tiempo conservamos tus datos",
        paragraphs: [
          "Conservamos tus datos solo durante el tiempo necesario para las finalidades que los justifican y para cumplir las obligaciones que nos impone la ley. Vencido el plazo, los suprimimos o los disociamos de modo que no puedan vincularse contigo.",
        ],
        list: [
          "Formularios de contacto o de agenda que no derivan en un servicio contratado: doce meses.",
          "Expediente, documentación y comunicaciones de un asunto atendido: cinco años contados desde la conclusión del asunto, por las obligaciones de guarda y confidencialidad propias del ejercicio profesional y por los plazos de prescripción aplicables.",
          "Registros contables, comprobantes fiscales y datos del cobro: cinco años, conforme al artículo 30 del Código Fiscal de la Federación.",
          "Registros de medición de tráfico, que no contienen datos personales: veinticuatro meses.",
          "Datos del seguimiento por mensajería: doce meses desde el último contacto, o antes si nos pides que dejemos de contactarte.",
        ],
      },
      {
        heading: "El pago: qué vemos y qué no",
        paragraphs: [
          "El cobro lo procesa Stripe en su propia plataforma. Cuando pulsas el botón de pago sales de nuestro sitio y capturas los datos de tu tarjeta directamente en Stripe.",
          "VERITUM nunca ve, recibe ni almacena el número de tu tarjeta, su fecha de vencimiento ni su código de seguridad. De tu pago conservamos únicamente el identificador que Stripe nos devuelve, el importe, la moneda y la fecha: lo que necesitamos para emitir tu comprobante y acreditar que tu cita está pagada.",
          "El tratamiento que Stripe hace de tus datos se rige además por su propia política de privacidad.",
        ],
      },
      {
        heading: "Los documentos que cargas en el portal del cliente",
        paragraphs: [
          "Si contrataste un servicio con revisión documental, el portal te permite cargar los archivos de tu asunto. Entras con tu número de teléfono y el folio de tu cita; sin ambos datos no es posible acceder.",
          "Finalidad: analizar tu documentación para prestarte el servicio contratado y preparar tu sesión. Nada más. Esos archivos no se usan para publicidad, no se comparten con terceros ajenos a tu asunto y no alimentan ningún sistema de decisiones automatizadas.",
          "Acceso: únicamente tú, a través del portal, y las personas del despacho que intervienen en tu asunto, a través del panel interno protegido con contraseña. La base de datos no es accesible públicamente.",
          "La carga viaja por una conexión cifrada (HTTPS) entre tu navegador y nuestro sitio. Los archivos se guardan en nuestra base de datos, cuyo acceso está restringido al personal autorizado.",
          `Conservación y eliminación: los archivos se conservan durante el plazo señalado para el expediente. Puedes pedirnos su eliminación anticipada escribiendo a ${CORREO}, salvo que debamos conservarlos para cumplir una obligación legal o para la defensa de un asunto en curso.`,
        ],
      },
      {
        heading: "Recordatorios automáticos por mensajería",
        paragraphs: [
          "Si nos escribes por WhatsApp u otro canal de mensajería, registramos tu número de teléfono y la hora de tu último contacto, y los enviamos a nuestro proveedor de automatización con una única finalidad: recordarte que la conversación quedó pendiente si no recibimos respuesta.",
          "Se envían como máximo tres recordatorios: a la hora, a las tres horas y a las veinticuatro horas de inactividad. Cada uno se envía una sola vez y nunca se repite. Si ya tienes una cita agendada, no se envía ninguno.",
          `Puedes pedirnos en cualquier momento que dejemos de enviártelos, respondiendo por el mismo canal o escribiendo a ${CORREO}. Atenderemos tu petición sin condicionarla a nada.`,
        ],
      },
      {
        heading: "Medidas de seguridad",
        paragraphs: [
          "Hemos adoptado medidas de seguridad administrativas, técnicas y físicas razonables para proteger tus datos contra daño, pérdida, alteración, destrucción o uso, acceso o tratamiento no autorizado: conexión cifrada en todo el sitio, acceso al panel interno mediante contraseña, sesiones firmadas con caducidad, acceso a la base de datos restringido al personal autorizado y validación de los archivos que se cargan.",
          "Ningún sistema es invulnerable. Si ocurriera una vulneración de seguridad que afecte de forma significativa tus derechos patrimoniales o morales, te lo informaremos sin dilación para que puedas tomar las medidas que correspondan, como exige la LFPDPPP.",
        ],
      },
      {
        heading: "Cambios a este aviso de privacidad",
        paragraphs: [
          "Este aviso puede modificarse para reflejar cambios en nuestros servicios, en nuestros proveedores o en la legislación aplicable.",
          "Cualquier modificación se publicará en esta misma página, que siempre muestra la fecha de su última actualización. Te recomendamos consultarla periódicamente.",
          `Cuando el cambio afecte de forma sustancial las finalidades del tratamiento o incorpore transferencias nuevas, te lo comunicaremos además por correo electrónico a la dirección que nos hayas proporcionado, antes de aplicarlo. Si no estás de acuerdo, puedes revocar tu consentimiento escribiendo a ${CORREO}.`,
        ],
      },
      {
        heading: "Aviso de privacidad simplificado",
        paragraphs: [
          `${RESPONSABLE} (VERITUM · Capital Humano & Legal), con domicilio en ${DOMICILIO}, trata tus datos de identificación y contacto, los datos de tu asunto y la documentación que cargues, con la finalidad de atender tu solicitud, prestarte el servicio jurídico contratado, cobrarlo y cumplir obligaciones legales y fiscales.`,
          `Como finalidades secundarias medimos este sitio y nuestras campañas, y podemos enviarte comunicaciones informativas. Puedes negarte escribiendo a ${CORREO} sin que ello afecte tu servicio.`,
          "Usamos proveedores para el cobro, el correo, el alojamiento y los recordatorios por mensajería. No vendemos ni compartimos tus datos con fines comerciales.",
          `Puedes ejercer tus derechos ARCO y revocar tu consentimiento en ${CORREO}. Este aviso integral está disponible de forma permanente en esta página.`,
        ],
      },
    ],
  },

  // ==========================================================================
  // TÉRMINOS DE USO
  // ==========================================================================
  {
    slug: "terminos-de-uso",
    title: "Términos de uso",
    updatedAt: ACTUALIZADO,
    body: [
      {
        heading: "Quiénes somos y qué aceptas al usar este sitio",
        paragraphs: [
          `Este sitio es operado por ${RESPONSABLE}, persona física que ejerce la abogacía bajo la denominación comercial VERITUM · Capital Humano & Legal, con domicilio en ${DOMICILIO}.`,
          "Al navegar por este sitio, enviar un formulario o contratar un servicio, aceptas estos términos. Si no estás de acuerdo con ellos, no utilices el sitio ni contrates los servicios.",
          `Para cualquier aclaración sobre estos términos puedes escribirnos a ${CORREO}.`,
        ],
      },
      {
        heading: "El contenido de este sitio es informativo, no es asesoría",
        paragraphs: [
          "Los artículos de la biblioteca, las descripciones de servicios y cualquier otro contenido publicado aquí tienen una finalidad informativa y divulgativa. No constituyen asesoría jurídica ni crean una relación abogado-cliente.",
          "Cada asunto depende de sus hechos, de sus documentos y de los plazos que corran. Leer este sitio no sustituye la valoración individual de un abogado y no debes tomar decisiones basándote únicamente en él.",
          "El contenido se elabora con cuidado y con referencia a la legislación vigente al momento de publicarse, pero la ley cambia. No garantizamos que todo el contenido esté actualizado en todo momento.",
        ],
      },
      {
        heading: "Qué incluye la asesoría laboral para patrones",
        paragraphs: [
          "Es una sesión por videollamada de hasta 60 minutos con un abogado, por un importe de $1,990 MXN, para conocer tu problema, valorar los antecedentes que nos compartas, explicarte tus alternativas con sus riesgos y plazos, y definir los siguientes pasos.",
          "Al terminar recibes por escrito los siguientes pasos concretos. Se agenda con al menos dos horas de anticipación.",
          "No incluye la revisión previa de documentación, ni la elaboración de escritos, ni la representación ante ninguna autoridad. Esos servicios se contratan por separado.",
        ],
      },
      {
        heading: "Qué incluye la revisión documental prioritaria",
        paragraphs: [
          "Es una revisión documental de alcance delimitado más una sesión por videollamada de hasta 60 minutos, por un importe de $3,490 MXN, para asuntos que requieren revisar una demanda, un citatorio, una notificación u otra documentación relevante.",
          "Se agenda con al menos 48 horas de anticipación. Ese plazo no es un trámite: es el tiempo que necesitamos para revisar tu documentación antes de hablar contigo. Si no cargas tu documentación con esa antelación, podemos proponerte mover la sesión.",
          "El alcance de la revisión se delimita y se te confirma por escrito antes de la sesión, a partir de lo que cargues en el portal. La revisión se limita a los documentos efectivamente cargados dentro del plazo.",
          "La disponibilidad del servicio prioritario se verifica antes de confirmar la atención. Si no podemos atenderlo en las condiciones ofrecidas, te lo informamos y te devolvemos el importe íntegro.",
        ],
      },
      {
        heading: "Qué asuntos atendemos y cuáles no",
        paragraphs: [
          "Nuestra práctica en materia laboral está construida para el lado del patrón: representamos a personas físicas con actividad empresarial y a personas morales en sus conflictos laborales. No representamos a trabajadores en asuntos laborales contra empresas.",
          "Lo decimos desde el principio por dos razones: para que no haya conflicto de interés en tu asunto, y porque no podemos representar a las dos partes de un mismo conflicto.",
          "No garantizamos ningún resultado. Ningún abogado puede hacerlo con honestidad: el resultado de un asunto depende de los hechos, de la prueba, de la contraparte y del criterio de la autoridad. Lo que sí garantizamos es el servicio descrito en estos términos.",
        ],
      },
      {
        heading: "El crédito de tu asesoría sobre los honorarios de representación",
        paragraphs: [
          "Si después de la sesión decides contratar a VERITUM para llevar tu caso, el importe que pagaste por la asesoría o la revisión se descuenta de los honorarios de representación, conforme a las condiciones siguientes.",
        ],
        list: [
          "Aplica al mismo asunto por el que pagaste la asesoría o la revisión.",
          "Aplica cuando el despacho acepta la representación. El despacho puede no aceptarla, y en ese caso el crédito no se genera y la asesoría ya prestada no es reembolsable.",
          "Se descuenta el 100 % del importe pagado, una sola vez por asunto. No es acumulable con otro crédito ni canjeable por dinero.",
          "Tiene una vigencia de 90 días naturales contados desde el pago, salvo que en tu correo de confirmación se indique un plazo distinto, que será el que aplique.",
          "Los honorarios de representación se cotizan por separado según las características de cada asunto y se formalizan en un documento aparte.",
        ],
      },
      {
        heading: "Pagos, comprobantes y facturación",
        paragraphs: [
          "Todos los importes están expresados en pesos mexicanos. El pago se realiza en línea a través de Stripe al momento de agendar, y tu cita queda confirmada únicamente cuando el pago se completa.",
          "Mientras el pago no se completa, el horario queda apartado por un tiempo limitado. Si el pago no se concluye dentro de ese plazo, el horario se libera automáticamente y queda disponible para otra persona.",
          `Si requieres factura, solicítala a ${CORREO} dentro del mes calendario en que realizaste el pago, indicando tu folio y tus datos fiscales. Fuera de ese plazo no es posible emitirla.`,
          "Los precios publicados pueden cambiar en cualquier momento. El precio aplicable es el que se muestra al momento de iniciar tu pago, y queda fijado en ese instante. Cuando se ofrece un precio promocional por tiempo limitado, la promoción expira en el servidor: si el plazo termina antes de que completes el pago, se cobra el precio vigente.",
        ],
      },
      {
        heading: "Reprogramación, cancelación e inasistencia",
        paragraphs: [
          "Puedes solicitar la cancelación o la reprogramación de tu cita desde la página de gestión de citas, con tu teléfono y tu folio, o escribiéndonos por los canales de contacto.",
          "Tu solicitud se registra y te la confirmamos por correo. Mientras no la confirmemos, tu horario sigue reservado a tu nombre: no se libera solo. Te lo decimos con claridad para que no des por hecho que tu cita quedó cancelada.",
          "Reprogramación sin costo: solicitada con al menos 24 horas de anticipación, una vez por cita, sujeta a disponibilidad. Para la revisión documental prioritaria, la nueva fecha vuelve a requerir 48 horas de anticipación.",
          "Si no te presentas a tu sesión y no avisaste con al menos 24 horas de anticipación, el servicio se tiene por prestado y el importe no es reembolsable. Reservamos ese tiempo y a ese abogado para ti.",
          "Si somos nosotros quienes no podemos atender tu sesión, te ofrecemos reprogramarla o te devolvemos el importe íntegro, lo que tú prefieras.",
        ],
      },
      {
        heading: "Cuándo existe relación profesional",
        paragraphs: [
          "Enviar un formulario, escribirnos por mensajería o agendar una cita no crea por sí solo una relación abogado-cliente ni obliga al despacho a aceptar tu asunto.",
          "La relación profesional para la asesoría o la revisión nace con el pago confirmado de ese servicio, y se limita a lo descrito en estos términos.",
          "La representación en un asunto es un servicio distinto: requiere que el despacho la acepte expresamente y que se formalice por escrito, con su propio alcance y sus propios honorarios.",
          "Todo lo que nos compartas está amparado por el deber de confidencialidad profesional, aunque finalmente no contrates.",
        ],
      },
      {
        heading: "Uso correcto del sitio y del portal del cliente",
        paragraphs: [
          "Te comprometes a proporcionar información veraz y a no suplantar a otra persona. El acceso al portal del cliente es personal: tu teléfono y tu folio son las llaves de tu expediente y no debes compartirlos.",
          "No está permitido intentar acceder a áreas restringidas, interferir con el funcionamiento del sitio, extraer datos de forma automatizada ni cargar archivos que contengan código malicioso.",
          "Podemos suspender el acceso al sitio o al portal, y cancelar una cita, cuando detectemos un uso contrario a estos términos. Si cancelamos por esa causa sin haber prestado el servicio, te devolvemos el importe.",
        ],
      },
      {
        heading: "Propiedad intelectual",
        paragraphs: [
          "Los textos, artículos, marcas, logotipos, diseño y demás contenidos de este sitio son propiedad de VERITUM o se utilizan con autorización, y están protegidos por la legislación en materia de propiedad intelectual.",
          "Puedes leerlos, citarlos y compartir el enlace indicando la fuente. No puedes reproducirlos de forma íntegra, modificarlos ni utilizarlos con fines comerciales sin autorización previa y por escrito.",
          "Los documentos que tú cargas en el portal siguen siendo tuyos. No adquirimos ningún derecho sobre ellos más allá de lo necesario para prestarte el servicio.",
        ],
      },
      {
        heading: "Limitación de responsabilidad",
        paragraphs: [
          "Procuramos que el sitio esté siempre disponible y que su contenido sea correcto, pero no podemos garantizar que funcione sin interrupciones ni errores. No respondemos por los daños derivados de una interrupción del servicio, de un fallo de los proveedores de los que depende el sitio o de causas ajenas a nuestro control.",
          "No respondemos por las decisiones que tomes basándote únicamente en el contenido informativo del sitio, sin una valoración profesional de tu caso.",
          "Nada en estos términos limita la responsabilidad profesional que nos corresponde por los servicios efectivamente contratados y prestados.",
        ],
      },
      {
        heading: "Cambios a estos términos",
        paragraphs: [
          "Podemos modificar estos términos para reflejar cambios en nuestros servicios o en la legislación aplicable. La versión vigente es siempre la publicada en esta página, que muestra la fecha de su última actualización.",
          "A los servicios ya contratados se les aplican los términos que estaban vigentes al momento de la contratación.",
        ],
      },
      {
        heading: "Legislación aplicable y jurisdicción",
        paragraphs: [
          "Estos términos se rigen por la legislación de los Estados Unidos Mexicanos.",
          "Para la interpretación y el cumplimiento de estos términos, las partes se someten a los tribunales competentes de Naucalpan de Juárez, Estado de México, renunciando a cualquier otro fuero que pudiera corresponderles por razón de su domicilio presente o futuro.",
          "Si eres consumidor, esta cláusula no afecta los derechos que la legislación en la materia te reconozca ni la posibilidad de acudir a las instancias previstas en ella.",
        ],
      },
    ],
  },

  // ==========================================================================
  // POLÍTICA DE COOKIES
  // ==========================================================================
  {
    slug: "politica-de-cookies",
    title: "Política de cookies",
    updatedAt: ACTUALIZADO,
    body: [
      {
        heading: "Qué son las cookies y tecnologías similares",
        paragraphs: [
          "Una cookie es un archivo muy pequeño que un sitio guarda en tu navegador para recordar algo entre una página y la siguiente. Junto a ellas usamos el almacenamiento local y el de sesión del navegador, que cumplen una función parecida.",
          "No todas sirven para lo mismo. Algunas son imprescindibles para que el sitio funcione; otras sirven para medir cómo se usa, y otras para publicidad. Las primeras se instalan siempre; las demás, solo si tú las aceptas.",
          `Esta política explica exactamente cuáles usamos y para qué. Complementa nuestro aviso de privacidad, al que corresponde todo lo relativo al tratamiento de datos personales por ${RESPONSABLE} (VERITUM).`,
        ],
      },
      {
        heading: "Cookies estrictamente necesarias",
        paragraphs: [
          "Se instalan sin pedirte permiso porque sin ellas el sitio no puede prestarte el servicio que estás solicitando. No sirven para seguirte ni para publicidad.",
        ],
        list: [
          "veritum_portal — mantiene tu sesión iniciada en el portal del cliente. Sin ella tendrías que volver a identificarte en cada página. Caduca al cerrar sesión o al vencer la sesión.",
          "veritum_panel — mantiene la sesión del panel interno. Solo la reciben las personas del despacho.",
          "veritum_promo — cookie firmada que registra el inicio de la vigencia de un precio promocional, para que el precio mostrado y el precio cobrado coincidan. No te identifica.",
          "veritum_consent_v1 — guarda en tu navegador la decisión que tomaste sobre las cookies, para no volver a preguntarte en cada visita.",
        ],
      },
      {
        heading: "Cookies de analítica",
        paragraphs: [
          "Nos ayudan a entender qué páginas se leen, cuáles se abandonan y dónde falla la navegación, para mejorar el sitio.",
          "Se cargan a través de Google Tag Manager y Google Analytics, y solo si las aceptas. Si las rechazas, no se carga ninguna etiqueta de Google: no es que se carguen y no midan, es que no llegan a descargarse.",
          "No enviamos a estas herramientas tu nombre, tu correo, tu teléfono ni la descripción de tu caso. Nunca.",
        ],
      },
      {
        heading: "Cookies de publicidad",
        paragraphs: [
          "Permiten medir el resultado de nuestras campañas y, en su caso, mostrar anuncios a quienes ya visitaron el sitio. Se cargan a través de Google y de Meta.",
          "Están desactivadas por omisión. Solo se cargan si las aceptas expresamente, y puedes aceptarlas sin aceptar las de analítica, o al revés.",
          "Cuando tomas tu decisión, se comunica a esas herramientas en forma de señales de consentimiento, de modo que respeten tu elección también en lo relativo a los datos publicitarios y a la personalización.",
        ],
      },
      {
        heading: "Medición propia de tráfico, sin cookies",
        paragraphs: [
          "Además de lo anterior llevamos un conteo propio que no usa cookies y no guarda tu dirección IP. Funciona siempre, porque no trata datos personales y no requiere consentimiento.",
          "Registra un identificador aleatorio que vive solo mientras la pestaña está abierta y se pierde al cerrarla (veritum_sid), la página visitada, el dominio desde el que llegaste, si entras desde móvil, tableta o escritorio, los parámetros de campaña (veritum_utm) y el tiempo de permanencia.",
          "Con eso sabemos cuántas visitas recibimos y qué páginas sirven. No permite identificarte, no te sigue entre sesiones y no se comparte con nadie.",
        ],
      },
      {
        heading: "Cómo cambiar o retirar tu decisión",
        paragraphs: [
          "Tu decisión se guarda en tu propio navegador. Para cambiarla, borra los datos de este sitio desde la configuración de tu navegador: la próxima vez que entres volveremos a preguntarte y podrás elegir de nuevo.",
          "También puedes bloquear o eliminar cookies directamente desde la configuración de privacidad de tu navegador, en cualquier momento y para cualquier sitio.",
          "Si bloqueas las cookies estrictamente necesarias, el portal del cliente dejará de funcionar: no podrás mantener la sesión iniciada. Las de analítica y publicidad puedes rechazarlas sin perder ninguna funcionalidad.",
        ],
      },
      {
        heading: "Proveedores",
        paragraphs: [
          "Las cookies que no son propias las instalan los siguientes proveedores, cada uno conforme a sus propias políticas:",
        ],
        list: [
          "Google LLC — Google Tag Manager y Google Analytics, para analítica y medición de campañas.",
          "Meta Platforms, Inc. — medición de campañas y audiencias publicitarias.",
          "Si en el futuro incorporamos otro proveedor, esta lista se actualizará antes de activarlo.",
        ],
      },
      {
        heading: "Cambios a esta política",
        paragraphs: [
          "Esta política puede actualizarse cuando cambien las herramientas que usamos o la legislación aplicable. La versión vigente es siempre la publicada en esta página, que muestra la fecha de su última actualización.",
          `Si tienes dudas sobre el uso de cookies en este sitio, escríbenos a ${CORREO}.`,
        ],
      },
    ],
  },
];

export const getLegal = (slug: string) => legalDocs.find((d) => d.slug === slug);
