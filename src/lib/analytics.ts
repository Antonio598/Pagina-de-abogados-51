// Medición (Bloque 7). Todos los eventos se envían a window.dataLayer para que
// Google Tag Manager los enrute a GA4 y Meta. Nunca se incluyen datos personales:
// ni nombres, ni correos, ni teléfonos, ni descripciones del caso.

export type AnalyticsEvent =
  | "page_view"
  | "servicio_visto"
  | "cta_agenda"
  | "agenda_iniciada"
  | "agenda_confirmada"
  | "formulario_enviado"
  | "whatsapp_click"
  | "telefono_click"
  | "correo_click"
  | "guia_descargada"
  | "scroll_relevante";

export type EventPayload = {
  page?: string;
  section?: string;
  service?: string;
  element_id?: string;
  result?: "iniciado" | "completado" | "error";
  modality?: string;
  percent?: 50 | 90;
  resource?: string;
};

type DataLayerEntry = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerEntry[];
  }
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const UTM_STORAGE = "veritum_utm";
const sentOnce = new Set<string>();

/** Conserva los parámetros UTM desde la llegada hasta la conversión. */
export const captureUtm = () => {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) found[k] = v;
    }
    if (Object.keys(found).length > 0) {
      window.sessionStorage.setItem(UTM_STORAGE, JSON.stringify(found));
    }
  } catch {
    // sessionStorage no disponible: se ignora.
  }
};

const readUtm = (): Record<string, string> => {
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
};

const deviceInfo = () => {
  if (typeof window === "undefined") return {};
  const w = window.innerWidth;
  return {
    device: w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop",
    resolution: `${window.screen.width}x${window.screen.height}`,
  };
};

export const track = (event: AnalyticsEvent, payload: EventPayload = {}, opts?: { once?: string }) => {
  if (typeof window === "undefined") return;
  if (opts?.once) {
    if (sentOnce.has(opts.once)) return;
    sentOnce.add(opts.once);
  }
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event,
    page: payload.page ?? window.location.pathname,
    ...payload,
    ...deviceInfo(),
    ...readUtm(),
    timestamp: new Date().toISOString(),
  });
};
