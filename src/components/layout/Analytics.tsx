"use client";

// Consentimiento + carga condicional de Google Tag Manager + eventos de página.
// GTM solo se inyecta después de que la persona acepta. Sin NEXT_PUBLIC_GTM_ID
// no se muestra el banner ni se carga ninguna etiqueta.

import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState, useSyncExternalStore } from "react";
import { env } from "@/lib/env";
import { captureUtm, track } from "@/lib/analytics";
import { trackVisit } from "@/lib/tracking";
import { Button } from "@/components/ui/Button";

const CONSENT_KEY = "veritum_consent_v1";
type Consent = { analytics: boolean; ads: boolean; at: string };

const readConsent = (): Consent | null => {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
};

const writeConsent = (c: Consent) => {
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
  } catch {
    // Sin almacenamiento: el banner volverá a mostrarse.
  }
};

// Pequeño store para leer el consentimiento sin setState dentro de efectos.
let cached: Consent | null | undefined;
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const getSnapshot = () => {
  if (cached === undefined) cached = readConsent();
  return cached;
};
const getServerSnapshot = () => undefined;
const setConsentStore = (c: Consent) => {
  cached = c;
  writeConsent(c);
  listeners.forEach((l) => l());
};

export const Analytics = () => {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [showConfig, setShowConfig] = useState(false);
  const [draft, setDraft] = useState({ analytics: true, ads: false });

  useEffect(() => {
    captureUtm();
  }, []);

  // page_view en cada cambio de ruta (GTM lo recibe si está cargado; si no, queda en dataLayer).
  useEffect(() => {
    track("page_view", { page: pathname });
  }, [pathname]);

  // Medición propia del sitio público (la landing tiene su propio registro).
  useEffect(() => {
    if (pathname.startsWith("/consulta") || pathname.startsWith("/panel")) return;
    return trackVisit(pathname, "sitio");
  }, [pathname]);

  // scroll_relevante al 50 % y 90 % de la página.
  useEffect(() => {
    let fired50 = false;
    let fired90 = false;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = (window.scrollY / max) * 100;
      if (!fired50 && pct >= 50) {
        fired50 = true;
        track("scroll_relevante", { page: pathname, percent: 50 });
      }
      if (!fired90 && pct >= 90) {
        fired90 = true;
        track("scroll_relevante", { page: pathname, percent: 90 });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const decide = (c: { analytics: boolean; ads: boolean }) => {
    setConsentStore({ ...c, at: new Date().toISOString() });
    setShowConfig(false);
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
      event: "consent_update",
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.ads ? "granted" : "denied",
      ad_user_data: c.ads ? "granted" : "denied",
      ad_personalization: c.ads ? "granted" : "denied",
    });
  };

  const loadGtm = consent?.analytics || consent?.ads;

  return (
    <>
      {env.gtmId && loadGtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
(function(w,d,s,l,i){var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+'&l='+l;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${env.gtmId}');`}
        </Script>
      )}

      {env.gtmId && consent === null && (
          <div
            role="region"
            aria-label="Consentimiento de cookies"
            className="anim-rise mb-safe fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-brand border border-gris bg-blanco p-5 shadow-card-hover md:inset-x-6"
          >
            <p className="text-[0.95rem] text-carbon">
              Usamos cookies de analítica y, si lo autorizas, de publicidad, para entender cómo se usa el sitio. Puedes cambiar tu decisión en{" "}
              <Link href="/politica-de-cookies" className="link-text !underline">
                Política de cookies
              </Link>
              .
            </p>
            {showConfig && (
              <div className="mt-4 space-y-2 text-sm">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked disabled className="size-4 accent-azul" /> Esenciales (siempre activas)
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={draft.analytics} onChange={(e) => setDraft({ ...draft, analytics: e.target.checked })} className="size-4 accent-azul" />{" "}
                  Analítica
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={draft.ads} onChange={(e) => setDraft({ ...draft, ads: e.target.checked })} className="size-4 accent-azul" /> Publicidad
                </label>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => decide({ analytics: true, ads: true })}>
                Aceptar
              </Button>
              <Button size="sm" variant="secondary" onClick={() => decide({ analytics: false, ads: false })}>
                Rechazar
              </Button>
              {showConfig ? (
                <Button size="sm" variant="ghost" onClick={() => decide(draft)}>
                  Guardar selección
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => setShowConfig(true)}>
                  Configurar
                </Button>
              )}
            </div>
          </div>
        )}
    </>
  );
};
