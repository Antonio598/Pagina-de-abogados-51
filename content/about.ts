// Quiénes somos — contenido literal aprobado (Bloque 5).
// NOTA: la sección "Equipo profesional" se omite hasta contar con datos confirmados
// (fotografía, nombre, cargo, cédula, áreas, síntesis curricular). No inventar perfiles.

export const about = {
  title: "Una firma legal que pone claridad en el centro",
  paragraphs: [
    "VERITUM nace con la convicción de que una persona o empresa puede tomar mejores decisiones cuando comprende su situación legal. Nuestro trabajo consiste en escuchar, analizar y traducir la complejidad jurídica en una estrategia clara, viable y responsable.",
    "Atendemos cada asunto con rigor profesional y cercanía. No partimos de soluciones automáticas: revisamos el contexto, los documentos, los objetivos y los riesgos antes de proponer una ruta.",
  ],
  way: {
    title: "Nuestra manera de trabajar",
    bullets: [
      "Escuchamos antes de recomendar.",
      "Explicamos de manera comprensible.",
      "Definimos prioridades y próximos pasos.",
      "Aclaramos alcances, tiempos estimados y honorarios.",
      "Mantenemos comunicación y seguimiento.",
      "Protegemos la confidencialidad de la información.",
    ],
  },
  mission: {
    title: "Misión",
    text: "Brindar asesoría y representación legal clara, estratégica y humana, ayudando a personas y empresas a comprender su situación, tomar decisiones informadas y proteger sus derechos e intereses con responsabilidad profesional.",
  },
  vision: {
    title: "Visión",
    text: "Ser una firma legal reconocida en la Ciudad de México y el Estado de México por hacer el derecho más comprensible, ofrecer estrategias útiles y construir relaciones de confianza mediante un acompañamiento cercano, ético y consistente.",
  },
  values: {
    title: "Valores",
    columns: ["Valor", "Cómo se expresa"],
    rows: [
      { value: "Claridad", expression: "Explicamos opciones, riesgos, costos y siguientes pasos en un lenguaje comprensible." },
      { value: "Integridad", expression: "Actuamos con honestidad, confidencialidad y respeto a la ley." },
      { value: "Estrategia", expression: "Cada acción responde a un diagnóstico y a un objetivo definido." },
      { value: "Acompañamiento humano", expression: "Escuchamos el contexto personal o empresarial y mantenemos comunicación cercana." },
      { value: "Responsabilidad", expression: "No prometemos resultados; establecemos alcances realistas y damos seguimiento." },
      { value: "Prevención", expression: "Buscamos anticipar riesgos y reducir conflictos antes de que escalen." },
      { value: "Confidencialidad", expression: "Protegemos la información que se nos confía y limitamos su uso al asunto autorizado." },
    ],
  },
} as const;
