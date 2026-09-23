"use client";

// Medición propia, de primera persona y sin datos personales: cuántas visitas
// recibe el sitio y la landing y cuánto tiempo se quedan. No guarda IP, no
// identifica a nadie y el identificador de sesión vive solo en sessionStorage
// (se pierde al cerrar la pestaña). Alimenta el panel interno.

const SESSION_KEY = "veritum_sid";
const UTM_KEY = "veritum_utm";

export type Area = "sitio" | "landing" | "panel";

const sessionId = () => {
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "sin-sesion";
  }
};

const device = () => {
  const w = window.innerWidth;
  return w < 640 ? "movil" : w < 1024 ? "tableta" : "escritorio";
};

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/**
 * Guarda las UTM de la llegada y devuelve las vigentes. Se hace aquí y no solo
 * en el sitio público porque el tráfico de anuncios entra por la landing: si no
 * se capturan en la primera vista, la campaña se pierde para siempre.
 */
const utm = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const nuevas: Record<string, string> = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) nuevas[k] = v.slice(0, 120);
    }
    if (Object.keys(nuevas).length > 0) {
      window.sessionStorage.setItem(UTM_KEY, JSON.stringify(nuevas));
      return nuevas;
    }
    return JSON.parse(window.sessionStorage.getItem(UTM_KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
};

const referrerHost = () => {
  try {
    if (!document.referrer) return undefined;
    const host = new URL(document.referrer).hostname;
    return host === window.location.hostname ? undefined : host;
  } catch {
    return undefined;
  }
};

/**
 * Registra una vista y, al salir de la página, su duración.
 * Devuelve la función de limpieza para usarla dentro de un efecto.
 */
export const trackVisit = (path: string, area: Area) => {
  if (typeof window === "undefined") return;

  const sid = sessionId();
  const inicio = Date.now();
  let enviadoFinal = false;

  const base = { sid, path, area, device: device(), referrer_host: referrerHost(), ...utm() };

  void fetch("/api/metrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...base, tipo: "view" }),
    keepalive: true,
  }).catch(() => {});

  const enviarDuracion = () => {
    if (enviadoFinal) return;
    enviadoFinal = true;
    const payload = JSON.stringify({ ...base, tipo: "duracion", duracion_ms: Date.now() - inicio });
    try {
      const blob = new Blob([payload], { type: "application/json" });
      if (!navigator.sendBeacon("/api/metrics", blob)) throw new Error("beacon");
    } catch {
      void fetch("/api/metrics", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
    }
  };

  const onHidden = () => {
    if (document.visibilityState === "hidden") enviarDuracion();
  };

  document.addEventListener("visibilitychange", onHidden);
  window.addEventListener("pagehide", enviarDuracion);

  return () => {
    document.removeEventListener("visibilitychange", onHidden);
    window.removeEventListener("pagehide", enviarDuracion);
    enviarDuracion();
  };
};
