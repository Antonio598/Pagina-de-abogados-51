// Contrato servidor → cliente de los servicios.
//
// Los componentes de cliente (BookingForm, tarjetas de precio) reciben esto y no
// el catálogo completo: solo datos serializables, nada de funciones. Pasar una
// función de un componente de servidor a uno de cliente rompe el renderizado.

import { creditoRepresentacion, productos, type Producto, type ProductoId } from "@content/productos";
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
};

export const vistaDe = (p: Producto): ProductoVista => ({
  id: p.id,
  nombre: p.nombre,
  centavos: p.precioCentavos,
  etiqueta: formatMoney(p.precioCentavos),
  moneda: MONEDA,
  duracionMinutos: p.duracionMinutos,
  leadMinutos: p.leadMinutos,
  resumen: p.resumen,
  incluye: p.incluye,
  requiereDocumentos: p.requiereDocumentos,
  ...(p.aviso ? { aviso: p.aviso } : {}),
});

export const productosVista = (): ProductoVista[] => productos.map(vistaDe);

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
