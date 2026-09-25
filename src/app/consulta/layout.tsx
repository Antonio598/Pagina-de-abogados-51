import type { Metadata } from "next";
import Link from "next/link";
import { legalNav, site } from "@content/site";
import { Logo } from "@/components/layout/Logo";
import { LandingTracker } from "@/components/landing/LandingTracker";

// Landing de campaña: layout propio, sin el header ni el footer del sitio.
// No se enlaza desde ninguna página pública y no se indexa.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function ConsultaLayout({ children }: LayoutProps<"/consulta">) {
  return (
    <div className="flex min-h-dvh flex-col bg-marfil">
      <LandingTracker />

      <header className="sticky top-0 z-40 border-b border-gris bg-marfil">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-3">
          <Logo size="sm" asLink={false} priority />
          <span className="text-[0.7rem] uppercase tracking-[0.12em] text-carbon/70 sm:text-xs">
            Defensa laboral patronal
          </span>
        </div>
      </header>

      <main id="contenido" className="relative flex-1">
        {children}
      </main>

      <footer className="border-t border-gris bg-blanco pb-safe">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <p className="text-sm text-carbon/75">{site.legalNotice}</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
            <li>
              <Link href="/portal" className="link-text inline-flex min-h-10 items-center">
                Portal del cliente
              </Link>
            </li>
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-text inline-flex min-h-10 items-center">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-carbon/70">
            © {new Date().getFullYear()} {site.name}. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
