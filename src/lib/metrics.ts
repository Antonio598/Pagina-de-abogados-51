import "server-only";
import { db, t } from "./db";

// Métricas de tráfico del panel. La agregación se hace en la base de datos:
// es más rápido y no trae datos innecesarios al servidor.

export type Resumen = { visitantes: number; vistas: number; permanenciaMs: number };

export type Metricas = {
  sitio: Resumen;
  landing: Resumen;
  serie: { etiqueta: string; sitio: number; landing: number }[];
  embudo: { label: string; valor: number }[];
  topPaths: [string, number][];
  topReferrers: [string, number][];
};

export const getMetricas = async (dias: number): Promise<Metricas> => {
  const sql = db();
  const desde = new Date(Date.now() - dias * 86_400_000);

  const [resumenes, serieBruta, embudoBruto, paths, referrers] = await Promise.all([
    sql<{ area: string; visitantes: number; vistas: number; permanencia: number }[]>`
      select area,
             count(distinct session_id)::int as visitantes,
             count(*)::int                   as vistas,
             coalesce(avg(duracion_ms) filter (where duracion_ms > 0), 0)::float as permanencia
        from ${t("page_events")}
       where created_at >= ${desde}
       group by area`,

    sql<{ dia: string; area: string; n: number }[]>`
      select to_char(created_at, 'YYYY-MM-DD') as dia, area, count(*)::int as n
        from ${t("page_events")}
       where created_at >= ${desde}
       group by 1, 2`,

    sql<{ visitas: number; formulario: number; iniciadas: number; pagadas: number }[]>`
      select
        (select count(distinct session_id)::int from ${t("page_events")}
          where created_at >= ${desde} and area = 'landing' and path = '/consulta')                     as visitas,
        (select count(distinct session_id)::int from ${t("page_events")}
          where created_at >= ${desde} and area = 'landing' and path like '/consulta/agendar%')         as formulario,
        (select count(*)::int from ${t("appointments")}
          where created_at >= ${desde} and origen = 'landing')                                         as iniciadas,
        (select count(*)::int from ${t("appointments")}
          where created_at >= ${desde} and origen = 'landing' and status = 'pagada')                    as pagadas`,

    sql<{ path: string; n: number }[]>`
      select path, count(*)::int as n from ${t("page_events")}
       where created_at >= ${desde} group by 1 order by n desc limit 8`,

    sql<{ referrer_host: string; n: number }[]>`
      select referrer_host, count(*)::int as n from ${t("page_events")}
       where created_at >= ${desde} and referrer_host is not null
       group by 1 order by n desc limit 6`,
  ]);

  const vacio: Resumen = { visitantes: 0, vistas: 0, permanenciaMs: 0 };
  const porArea = (area: string): Resumen => {
    const r = resumenes.find((x) => x.area === area);
    return r ? { visitantes: r.visitantes, vistas: r.vistas, permanenciaMs: r.permanencia } : vacio;
  };

  const serie: Metricas["serie"] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const dia = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    const de = (area: string) => serieBruta.find((x) => x.dia === dia && x.area === area)?.n ?? 0;
    serie.push({ etiqueta: dia.slice(8, 10), sitio: de("sitio"), landing: de("landing") });
  }

  const e = embudoBruto[0] ?? { visitas: 0, formulario: 0, iniciadas: 0, pagadas: 0 };

  return {
    sitio: porArea("sitio"),
    landing: porArea("landing"),
    serie,
    embudo: [
      { label: "Visitas a la landing", valor: e.visitas },
      { label: "Abrieron el formulario", valor: e.formulario },
      { label: "Iniciaron el pago", valor: e.iniciadas },
      { label: "Pagaron", valor: e.pagadas },
    ],
    topPaths: paths.map((p) => [p.path, p.n] as [string, number]),
    topReferrers: referrers.map((r) => [r.referrer_host, r.n] as [string, number]),
  };
};
