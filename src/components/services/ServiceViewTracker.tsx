"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Emite servicio_visto una vez por visita a la página del servicio. */
export const ServiceViewTracker = ({ slug }: { slug: string }) => {
  useEffect(() => {
    track("servicio_visto", { service: slug, section: "page", result: "completado" }, { once: `servicio_visto:${slug}` });
  }, [slug]);
  return null;
};
