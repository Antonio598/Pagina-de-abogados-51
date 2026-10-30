"use client";

// Banner de consentimiento + etiquetas de Google (Tag Manager y Google Ads).
//
// POR QUÉ VIVE APARTE DE <Analytics />. Analytics solo se monta en el layout del
// sitio público, y la landing /consulta tiene layout propio. El tráfico de
// anuncios entra por la landing, así que una etiqueta montada solo en Analytics
// no se cargaría nunca justo donde hay que medir. Este componente lo montan los
// dos layouts.
//
// NINGUNA ETIQUETA SE CARGA SIN CONSENTIMIENTO. No es una preferencia de estilo:
// la política de cookies publicada dice, con esas palabras, que si rechazas no
// se carga ninguna etiqueta de Google. El código y el documento legal tienen que
// decir lo mismo.
//
// El modo de consentimiento v2 se envía igualmente (default denegado y luego
// update) porque es lo que Google espera encontrar en la cola de dataLayer antes
// de su propia configuración.

import Link from "next/link";
import Script from "next/script";
import { useState, useSyncExternalStore } from "react";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/Button";

const CONSENT_KEY = "veritum_consent_v1";

export type Consent = { analytics: boolean; ads: boolean; at: string };

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

// Store mínimo para leer el consentimiento sin setState dentro de un efecto.
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

const senal = (ok: boolean) => (ok ? "granted" : "denied");

/**
 * Cola de gtag: primero el estado por omisión (denegado), después la decisión
 * de la persona y solo entonces la configuración. Ese orden es el que Google
 * necesita; gtag.js procesa la cola cuando termina de cargar, así que da igual
 * si este script corre antes o después que el externo.
 */
const colaGtag = (c: Consent, adsId: string) => `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
gtag('consent','update',{ad_storage:'${senal(c.ads)}',ad_user_data:'${senal(c.ads)}',ad_personalization:'${senal(c.ads)}',analytics_storage:'${senal(c.analytics)}'});
gtag('js', new Date());
gtag('config', '${adsId}');`;

const gtmSnippet = (id: string) => `
window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});
(function(w,d,s,l,i){var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+'&l='+l;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;

export const ConsentTags = () => {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [showConfig, setShowConfig] = useState(false);
  const [draft, setDraft] = useState({ analytics: true, ads: false });

  // Sin ninguna etiqueta configurada no hay nada que consentir: ni banner.
  const hayEtiquetas = Boolean(env.gtmId || env.googleAdsId);

  const cargarGtm = Boolean(env.gtmId) && Boolean(consent?.analytics || consent?.ads);
  // Google Ads es publicidad: solo con el consentimiento de publicidad.
  const cargarAds = Boolean(env.googleAdsId) && Boolean(consent?.ads);

  const decidir = (c: { analytics: boolean; ads: boolean }) => {
    setConsentStore({ ...c, at: new Date().toISOString() });
    setShowConfig(false);
    // Para quien ya tuviera las etiquetas cargadas en esta misma visita.
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
      event: "consent_update",
      analytics_storage: senal(c.analytics),
      ad_storage: senal(c.ads),
      ad_user_data: senal(c.ads),
      ad_personalization: senal(c.ads),
    });
  };

  if (!hayEtiquetas) return null;

  return (
    <>
      {cargarGtm && env.gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {gtmSnippet(env.gtmId)}
        </Script>
      )}

      {cargarAds && env.googleAdsId && consent && (
        <>
          <Script
            id="gtag-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${env.googleAdsId}`}
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {colaGtag(consent, env.googleAdsId)}
          </Script>
        </>
      )}

      {consent === null && (
        <div
          role="region"
          aria-label="Consentimiento de cookies"
          className="anim-rise mb-safe fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-brand border border-gris bg-blanco p-5 shadow-card-hover md:inset-x-6"
        >
          <p className="text-[0.95rem] text-carbon">
            Usamos cookies de analítica y, si lo autorizas, de publicidad, para entender cómo se usa el sitio. Puedes
            cambiar tu decisión en{" "}
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
                <input
                  type="checkbox"
                  checked={draft.analytics}
                  onChange={(e) => setDraft({ ...draft, analytics: e.target.checked })}
                  className="size-4 accent-azul"
                />{" "}
                Analítica
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={draft.ads}
                  onChange={(e) => setDraft({ ...draft, ads: e.target.checked })}
                  className="size-4 accent-azul"
                />{" "}
                Publicidad
              </label>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => decidir({ analytics: true, ads: true })}>
              Aceptar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => decidir({ analytics: false, ads: false })}>
              Rechazar
            </Button>
            {showConfig ? (
              <Button size="sm" variant="ghost" onClick={() => decidir(draft)}>
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
