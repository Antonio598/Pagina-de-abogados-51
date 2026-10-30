"use client";

// Medición del sitio público: eventos de página y conteo propio de visitas.
//
// El banner de consentimiento y las etiquetas de Google ya NO viven aquí: se
// fueron a <ConsentTags />, porque este componente solo se monta en el layout
// del sitio y la landing /consulta tiene el suyo. El tráfico de anuncios entra
// por la landing, así que la etiqueta tiene que montarse en las dos.

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { captureUtm, track } from "@/lib/analytics";
import { trackVisit } from "@/lib/tracking";
import { ConsentTags } from "@/components/layout/ConsentTags";

export const Analytics = () => {
  const pathname = usePathname();

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

  return <ConsentTags />;
};
