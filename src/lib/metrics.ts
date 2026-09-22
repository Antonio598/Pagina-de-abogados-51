import "server-only";
import { db, type PageEvent } from "./db";

// Consulta y agrega las métricas de tráfico del panel. Vive fuera del
// componente para que la página no haga cálculos de tiempo durante el render.

export type Resumen = {
  visitantes: number;
  vistas: number;
  permanenciaMs: number;
};

export type Metricas = {
  sitio: Resumen;
  landing: Resumen;
  serie: { etiqueta: string; sitio: number; landing: number }[];
  embudo: { label: string; valor: number }[];
  topPaths: [string, number][];
  topReferrers: [string, number][];
};

type Evento = Pick<PageEvent, "session_id" | "path" | "area" | "duracion_ms" | "created_at" | "referrer_host">;

const resumen = (lista: Evento[]): Resumen => {
  const conDuracion = lista.filter((e) => (e.duracion_ms ?? 0) > 0);
  return {
    visitantes: new Set(lista.map((e) => e.session_id)).size,
    vistas: lista.length,
    permanenciaMs: conDuracion.length === 0 ? 0 : conDuracion.reduce((s, e) => s + (e.duracion_ms ?? 0), 0) / conDuracion.length,
  };
};

const cuenta = (lista: Evento[], key: (e: Evento) => string | null) => {
  const acc: Record<string, number> = {};
  for (const e of lista) {
    const k = key(e);
    if (k) acc[k] = (acc[k] ?? 0) + 1;
  }
  return Object.entries(acc).sort((a, b) => b[1] - a[1]);
};

export const getMetricas = async (dias: number): Promise<Metricas> => {
  const ahora = Date.now();
  const desde = new Date(ahora - dias * 86_400_000).toISOString();

  const [eventosRes, citasRes] = await Promise.all([
    db().from("page_events").select("session_id, path, area, duracion_ms, created_at, referrer_host").gte("created_at", desde).limit(20000),
    db().from("appointments").select("status, origen").gte("created_at", desde).limit(5000),
  ]);

  if (eventosRes.error) console.error("[metricas] eventos", eventosRes.error);
  if (citasRes.error) console.error("[metricas] citas", citasRes.error);

  const eventos = (eventosRes.data ?? []) as Evento[];
  const citas = (citasRes.data ?? []) as { status: string; origen: string }[];

  const sitio = eventos.filter((e) => e.area === "sitio");
  const landing = eventos.filter((e) => e.area === "landing");

  const serie: Metricas["serie"] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const dia = new Date(ahora - i * 86_400_000).toISOString().slice(0, 10);
    serie.push({
      etiqueta: dia.slice(8, 10),
      sitio: sitio.filter((e) => e.created_at.startsWith(dia)).length,
      landing: landing.filter((e) => e.created_at.startsWith(dia)).length,
    });
  }

  const unicos = (lista: Evento[]) => new Set(lista.map((e) => e.session_id)).size;

  return {
    sitio: resumen(sitio),
    landing: resumen(landing),
    serie,
    embudo: [
      { label: "Visitas a la landing", valor: unicos(landing.filter((e) => e.path === "/consulta")) },
      { label: "Abrieron el formulario", valor: unicos(landing.filter((e) => e.path.startsWith("/consulta/agendar"))) },
      { label: "Iniciaron el pago", valor: citas.filter((c) => c.origen === "landing").length },
      { label: "Pagaron", valor: citas.filter((c) => c.origen === "landing" && c.status === "pagada").length },
    ],
    topPaths: cuenta(eventos, (e) => e.path).slice(0, 8),
    topReferrers: cuenta(eventos, (e) => e.referrer_host).slice(0, 6),
  };
};
