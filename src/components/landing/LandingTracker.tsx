"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackVisit } from "@/lib/tracking";

/** Registra la visita a la landing en la medición propia (sin datos personales). */
export const LandingTracker = () => {
  const pathname = usePathname();
  useEffect(() => trackVisit(pathname, "landing"), [pathname]);
  return null;
};
