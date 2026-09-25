// ============================================================================
// Portal del cliente (/portal) — PENDIENTE DE APROBACIÓN DE VERITUM.
//
// El cliente entra con su teléfono y el folio que recibió al pagar, y carga la
// documentación de su asunto. El checklist cambia según su situación.
//
// Ningún texto de aquí pide documentos que no se vayan a usar, ni promete un
// resultado por entregarlos.
// ============================================================================

import type { SituacionId } from "./productos";

export const portal = {
  acceso: {
    eyebrow: "Portal del cliente",
    title: "Entra a tu expediente",
    text: "Con tu teléfono y el folio que recibiste al confirmar tu pago puedes cargar la documentación de tu asunto y revisar lo que ya nos enviaste.",
    telefonoLabel: "Teléfono",
    telefonoHint: "El mismo que registraste al agendar.",
    folioLabel: "Folio",
    folioHint: "Lo recibiste al pagar, con el formato VER-XXXXXX.",
    cta: "Entrar",
    // Un solo mensaje para todos los fallos: no revela si el folio existe.
    error:
      "No encontramos un expediente con esos datos. Revisa tu folio (lo recibiste al pagar, con el formato VER-XXXXXX) y el teléfono tal como lo registraste.",
    bloqueado:
      "Demasiados intentos. Por seguridad, espera unos minutos antes de volver a intentarlo.",
    noConfigurado:
      "El portal no está disponible en este momento. Escríbenos por los canales de contacto y te ayudamos.",
    ayuda: "¿No encuentras tu folio? Está en el correo de confirmación de tu cita.",
  },

  expediente: {
    eyebrow: "Tu expediente",
    title: "Documentación de tu asunto",
    text: "Carga aquí lo que tengas. Si te falta algo, súbelo después: puedes volver a entrar con los mismos datos.",
    salir: "Salir",
    sesionTitulo: "Tu sesión",
    enlacePendiente:
      "Te enviaremos el enlace de la videollamada por correo antes de tu sesión.",
    enlaceCta: "Entrar a la videollamada",

    cargaTitulo: "Cargar documentos",
    cargaTexto:
      "Formatos aceptados: PDF, JPG, PNG, WEBP, HEIC, DOCX y XLSX. Hasta 15 MB por archivo y 3 archivos por envío.",
    cargaCta: "Subir documentos",
    cargaVacia: "Elige al menos un archivo.",

    listaTitulo: "Lo que ya nos enviaste",
    listaVacia: "Todavía no has cargado ningún documento.",
    descargar: "Descargar",

    // Mensajes de resultado, seleccionados por el parámetro de la URL para que
    // el formulario funcione sin JavaScript.
    ok: (n: number) => (n === 1 ? "Se cargó 1 documento." : `Se cargaron ${n} documentos.`),
    errores: {
      tamano: "Alguno de los archivos pasa de 15 MB. Comprímelo o divídelo y vuelve a intentarlo.",
      tipo: "Solo aceptamos PDF, JPG, PNG, WEBP, HEIC, DOCX y XLSX. Revisa el formato del archivo.",
      contenido:
        "El contenido de alguno de los archivos no coincide con su extensión. Vuelve a exportarlo y súbelo de nuevo.",
      cantidad: "Puedes subir hasta 3 archivos por envío.",
      tope: "Llegaste al límite de documentos de tu expediente. Escríbenos y lo revisamos contigo.",
      vacio: "Elige al menos un archivo.",
      generico: "No pudimos guardar los documentos. Inténtalo de nuevo.",
    } as Record<string, string>,
  },

  aviso:
    "Los documentos que cargues se usan únicamente para atender tu asunto. No los compartimos con terceros ajenos a tu caso. Puedes pedir su eliminación escribiéndonos por los canales de contacto.",
} as const;

// ---------------------------------------------------------------------------
// Qué documentación se pide según la situación
// ---------------------------------------------------------------------------

export type Checklist = {
  titulo: string;
  texto: string;
  /** Lo que de verdad hace falta para poder trabajar el asunto. */
  necesario: readonly string[];
  /** Lo que ayuda si lo tiene a mano. */
  util: readonly string[];
};

const comunes: readonly string[] = [
  "Contrato de trabajo, si existe.",
  "Recibos de nómina de los últimos meses.",
  "Alta y movimientos ante el IMSS.",
];

export const checklists: Record<SituacionId, Checklist> = {
  citatorio: {
    titulo: "Para tu citatorio de conciliación",
    texto: "Con esto podemos valorar la contingencia antes de la audiencia.",
    necesario: [
      "El citatorio completo, con todas sus páginas y sellos.",
      "Identificación del trabajador o su nombre completo, si el citatorio no lo trae claro.",
      ...comunes,
    ],
    util: [
      "Cualquier convenio, renuncia o recibo de liquidación que se haya firmado.",
      "Comunicaciones con el trabajador (mensajes, correos) relacionadas con la salida.",
      "Control de asistencia o de vacaciones, si lo tienes.",
    ],
  },
  demanda: {
    titulo: "Para tu demanda o notificación laboral",
    texto: "Con esto podemos leer qué te reclaman y qué plazos están corriendo.",
    necesario: [
      "La demanda o la notificación completa, con todas sus páginas y sellos.",
      "El acuse o la constancia de cuándo te la entregaron.",
      ...comunes,
    ],
    util: [
      "El acta de la audiencia de conciliación, si ya hubo una.",
      "Documentos de la terminación: renuncia, convenio, recibo de liquidación.",
      "Reglamento interior de trabajo o políticas firmadas por el trabajador.",
    ],
  },
  terminacion: {
    titulo: "Para terminar una relación laboral o negociar una salida",
    texto: "Con esto podemos calcular lo que corresponde y documentar el cierre.",
    necesario: [
      ...comunes,
      "Fecha de ingreso y salario real del trabajador (incluyendo lo que no va en nómina, si aplica).",
    ],
    util: [
      "Expediente del trabajador: contrato, anexos, aumentos, puesto.",
      "Actas administrativas, amonestaciones o incidencias, si hay.",
      "Control de vacaciones y de pagos de aguinaldo y prima vacacional.",
    ],
  },
};

/** Checklist genérico para citas sin situación (p. ej. las de /agenda). */
export const checklistGenerico: Checklist = {
  titulo: "Documentación de tu asunto",
  texto: "Carga lo que tengas relacionado con tu situación.",
  necesario: ["Cualquier documento oficial que hayas recibido, completo y con sus sellos."],
  util: ["Contratos, recibos o comunicaciones relacionadas con el asunto."],
};

export const checklistDe = (situacion: string | null | undefined): Checklist =>
  (situacion && checklists[situacion as SituacionId]) || checklistGenerico;
