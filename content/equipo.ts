// ============================================================================
// Equipo profesional. VACÍO A PROPÓSITO.
//
// NO INVENTAR perfiles, nombres, cédulas ni fotografías, ni usar imágenes de
// banco. Es la misma regla que ya rige en content/about.ts y en la página de
// Quiénes somos.
//
// La sección de la landing solo se renderiza con perfiles cuando este arreglo
// tiene elementos: basta añadirlos (y subir las fotos a public/equipo/) para
// encenderla, sin tocar ningún componente.
//
// Requisitos por perfil, todos obligatorios:
//   · fotografía real (no de banco) en public/equipo/
//   · nombre completo y cargo
//   · cédula profesional y la institución que la expidió
//   · áreas de práctica y síntesis curricular
// ============================================================================

export type MiembroEquipo = {
  slug: string;
  nombre: string;
  cargo: string;
  cedula: string;
  cedulaInstitucion: string;
  areas: readonly string[];
  sintesis: string;
  /** Ruta dentro de /public, p. ej. "/equipo/nombre.jpg". */
  foto: string;
  fotoAlt: string;
};

export const equipo: readonly MiembroEquipo[] = [];

/**
 * Lo que se muestra MIENTRAS no hay perfiles publicados.
 * Todo lo que afirma es verdadero y verificable por el cliente: no sustituye la
 * confianza con adjetivos, la sustituye con un compromiso comprobable.
 */
export const equipoPendiente = {
  eyebrow: "Quién te atiende",
  title: "Sabrás con quién hablas antes de la sesión",
  text: "Antes de tu videollamada te enviamos por correo el nombre completo y la cédula profesional del abogado que atenderá tu asunto, para que puedas verificarla en el Registro Nacional de Profesionistas de la SEP.",
  puntos: [
    "Nombre completo y cédula profesional del abogado asignado, antes de la sesión.",
    "Un solo interlocutor para tu asunto, de principio a fin.",
    "Confidencialidad de la información que nos compartes, limitada al asunto que autorices.",
    "Si no podemos atender tu asunto, te lo decimos antes de la sesión y te devolvemos el importe.",
  ],
  verificaHref: "https://www.cedulaprofesional.sep.gob.mx/cedula/presidencia/indexAvanzada.action",
  verificaLabel: "Registro Nacional de Profesionistas",
} as const;
