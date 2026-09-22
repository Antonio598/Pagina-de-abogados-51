import type { Metadata } from "next";
import Link from "next/link";
import { legalNav, site } from "@content/site";
import { Logo } from "@/components/layout/Logo";
import { PromoBar } from "@/components/landing/PromoBar";
import { LandingTracker } from "@/components/landing/LandingTracker";
import { getPromo } from "@/lib/promo-server";

// Landing de campaña: layout propio, sin el header ni el footer del sitio.
// No se enlaza desde ninguna página pública y no se indexa.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function ConsultaLayout({ children }: LayoutProps<"/consulta">) {
  const { promo } = await getPromo();

  return (
    <div className="flex min-h-dvh flex-col bg-marfil">
      <LandingTracker />

      <header className="sticky top-0 z-40 border-b border-gris bg-marfil">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-3">
          <Logo size="sm" asLink={false} />
          <PromoBar restanteMs={promo.restanteMs} enabled={promo.enabled} />
        </div>
      </header>

      <main id="contenido" className="flex-1">
        {children}
      </main>

      <footer className="border-t border-gris bg-blanco pb-safe">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <p className="text-sm text-carbon/75">{site.legalNotice}</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-text inline-block py-1.5">
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
