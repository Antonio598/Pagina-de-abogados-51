import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { portal } from "@content/portal";
import { site } from "@content/site";

// El portal no se indexa ni se enlaza desde el sitio público: se llega con el
// folio, desde el correo de confirmación o desde la página de confirmación.
export const metadata: Metadata = {
  title: "Portal del cliente · VERITUM",
  robots: { index: false, follow: false, nocache: true },
};

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <div className="flex min-h-dvh flex-col bg-marfil">
      <header className="border-b border-gris bg-marfil/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo size="sm" asLink={false} />
          <span className="text-xs uppercase tracking-wider text-carbon/70">Portal del cliente</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>

      <footer className="border-t border-gris px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-2 text-xs text-carbon/70">
          <p>{portal.aviso}</p>
          <p>{site.legalNotice}</p>
          <p>
            <Link href="/aviso-de-privacidad" className="link-text inline-flex min-h-10 items-center">
              Aviso de privacidad
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
