/** Inserta datos estructurados JSON-LD sin datos personales. */
export const JsonLd = ({ data }: { data: object | object[] }) => (
  <script
    type="application/ld+json"
    // JSON serializado en servidor; se escapan "<" para evitar cierre de etiqueta.
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }}
  />
);
