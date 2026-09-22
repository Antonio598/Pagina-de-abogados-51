// Proceso y Estrategia legal preventiva — contenido literal aprobado (Bloque 5).

export const process = {
  title: "Un proceso claro desde el primer contacto",
  steps: [
    { title: "Contacto inicial", text: "Completa el formulario o utiliza el canal autorizado. Comparte solo la información indispensable." },
    { title: "Agenda y confirmación", text: "Selecciona modalidad y horario disponibles. Recibirás las condiciones de la asesoría." },
    { title: "Asesoría inicial", text: "Revisamos antecedentes, objetivos y documentos relevantes." },
    { title: "Diagnóstico preliminar", text: "Explicamos alternativas, riesgos y posibles siguientes pasos." },
    { title: "Propuesta de servicio", text: "Si el asunto requiere trabajo adicional, se presenta el alcance, honorarios y condiciones." },
    { title: "Ejecución y seguimiento", text: "Una vez formalizada la contratación, se inicia el servicio y se acuerdan los canales de comunicación." },
  ],
  prepare: {
    title: "Qué preparar para la asesoría",
    bullets: [
      "Una cronología breve de los hechos.",
      "Identificación de las personas o empresas involucradas.",
      "Documentos principales en formato legible.",
      "Fechas límite, audiencias, notificaciones o comunicaciones recibidas.",
      "Preguntas y objetivo que deseas alcanzar.",
    ],
  },
  note: {
    title: "Nota destacada",
    text: "No envíes originales ni información sensible por canales no confirmados. Si existe una fecha legal próxima, indícala desde el primer contacto.",
  },
  cta: { label: "Agenda una asesoría", href: "/agenda" },
} as const;

export const preventive = {
  title: "Prevenir también es una forma de proteger",
  intro:
    "La asesoría legal no debe comenzar únicamente cuando el conflicto ya existe. Una revisión oportuna puede detectar obligaciones, vacíos documentales y decisiones que conviene corregir antes de que se conviertan en un problema.",
  people: {
    title: "Para personas",
    bullets: [
      "Revisión de acuerdos antes de firmar.",
      "Organización documental previa a una separación.",
      "Planeación y evidencia de gastos familiares.",
      "Identificación de riesgos en obligaciones y contratos.",
    ],
  },
  companies: {
    title: "Para empresas",
    bullets: [
      "Auditoría básica de contratos y expedientes.",
      "Protocolos laborales y documentación de incidencias.",
      "Revisión de relaciones con proveedores.",
      "Políticas internas, responsabilidades y autorizaciones.",
      "Calendario de obligaciones y revisiones periódicas.",
    ],
  },
  cta: { label: "Solicita un diagnóstico preventivo", href: "/agenda?tipo=empresa" },
} as const;
