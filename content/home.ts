// Página Inicio — contenido literal aprobado (Bloque 5).

export const home = {
  hero: {
    title: "Asesoría legal clara para tomar decisiones con confianza",
    text: "Analizamos tu situación, explicamos tus opciones y construimos una estrategia legal con acompañamiento cercano para personas, trabajadores y empresas en la Ciudad de México y el Estado de México.",
    primary: { label: "Agenda una asesoría", href: "/agenda" },
    secondary: { label: "Conoce nuestros servicios", href: "/servicios" },
  },
  selector: {
    title: "¿En qué podemos ayudarte?",
  },
  trust: {
    text: "Un problema legal no debería obligarte a decidir a ciegas. En VERITUM empezamos por entender tu contexto, identificar riesgos y explicarte de manera clara qué alternativas existen, qué implica cada una y cuál puede ser el siguiente paso.",
    bullets: [
      "Atención profesional y personalizada.",
      "Explicación clara de opciones, riesgos y alcances.",
      "Estrategia adaptada a cada caso.",
      "Seguimiento responsable y comunicación cercana.",
    ],
  },
  servicesTitle: "Servicios",
  servicesCta: "Conocer servicio",
  why: {
    title: "Por qué elegir VERITUM",
    bullets: [
      "Porque primero entendemos el problema y después proponemos una ruta.",
      "Porque hablamos con claridad y evitamos tecnicismos innecesarios.",
      "Porque explicamos los alcances sin generar falsas expectativas.",
      "Porque combinamos atención humana con una visión estratégica y preventiva.",
    ],
  },
  how: {
    title: "Cómo trabajamos",
    steps: [
      "Nos compartes brevemente tu situación.",
      "Agendamos una asesoría para revisar contexto y documentos.",
      "Identificamos alternativas, riesgos y prioridades.",
      "Definimos alcance, honorarios y plan de acción.",
      "Damos seguimiento conforme al servicio contratado.",
    ],
  },
  library: {
    title: "Información legal para decidir mejor",
    text: "Consulta guías y herramientas prácticas elaboradas para ayudarte a ordenar información, reconocer riesgos y preparar una conversación jurídica más productiva.",
    cta: { label: "Explorar la Biblioteca", href: "/biblioteca" },
  },
  faqTitle: "Preguntas frecuentes",
  closing: {
    title: "Da el primer paso con información clara",
    text: "Una asesoría permite revisar tu situación, identificar opciones y definir los siguientes pasos. Cada caso requiere un análisis individual.",
    cta: { label: "Agenda una asesoría", href: "/agenda" },
  },
} as const;
