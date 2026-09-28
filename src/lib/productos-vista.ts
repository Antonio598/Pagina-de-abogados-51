// Contrato servidor → cliente de los servicios.
//
// Los componentes de cliente reciben esto y no el catálogo: solo datos
// serializables, nada de funciones. Pasar una función de un componente de
// servidor a uno de cliente rompe el renderizado.

import { creditoRepresentacion, productos, promocion, type Producto, type ProductoId } from "@content/productos";
import { formatMoney, MONEDA } from "./pricing";

export type ProductoVista = {
  id: ProductoId;
  nombre: string;
  centavos: number;
  etiqueta: string;
  moneda: string;
  duracionMinutos: number;
  leadMinutos: number;
  resumen: string;
  incluye: readonly string[];
  requiereDocumentos: boolean;
  aviso?: string;
  /** Precio de lanzamiento vigente ahora mismo para este servicio. */
  promoActiva: boolean;
  /** Precio normal, para tacharlo cuando hay promoción. */
  etiquetaNormal: string;
  /** Etiqueta de la promoción ("Precio de lanzamiento"). */
  etiquetaPromo?: string;
};

/**
 * `promoActiva` la resuelve el servidor leyendo la cookie firmada. Se pasa como
 * argumento para que este módulo no dependa de la petición.
 */
export const vistaDe = (p: Producto, promoActiva = false): ProductoVista => {
  const conPromo = promoActiva && p.id === promocion.productoId;
  const centavos = conPromo ? promocion.precioCentavos : p.precioCentavos;
  return {
    id: p.id,
    nombre: p.nombre,
    centavos,
    etiqueta: formatMoney(centavos),
    etiquetaNormal: formatMoney(p.precioCentavos),
    moneda: MONEDA,
    duracionMinutos: p.duracionMinutos,
    leadMinutos: p.leadMinutos,
    resumen: p.resumen,
    incluye: p.incluye,
    requiereDocumentos: p.requiereDocumentos,
    promoActiva: conPromo,
    ...(conPromo ? { etiquetaPromo: promocion.etiqueta } : {}),
    ...(p.aviso ? { aviso: p.aviso } : {}),
  };
};

export const productosVista = (promoActiva = false): ProductoVista[] =>
  productos.map((p) => vistaDe(p, promoActiva));

/** El texto del crédito ya resuelto en importes, listo para pintar. */
export const creditoVista = () => ({
  titulo: creditoRepresentacion.titulo,
  texto: creditoRepresentacion.texto,
  condiciones: creditoRepresentacion.condiciones,
  ejemplo: {
    titulo: creditoRepresentacion.ejemplo.titulo,
    nota: creditoRepresentacion.ejemplo.nota,
    asesoria: creditoRepresentacion.ejemplo.asesoriaCentavos,
    honorarios: creditoRepresentacion.ejemplo.honorariosCentavos,
    saldo: creditoRepresentacion.ejemplo.saldoCentavos,
    asesoriaEtiqueta: formatMoney(creditoRepresentacion.ejemplo.asesoriaCentavos),
    honorariosEtiqueta: formatMoney(creditoRepresentacion.ejemplo.honorariosCentavos),
    saldoEtiqueta: formatMoney(creditoRepresentacion.ejemplo.saldoCentavos),
  },
});
