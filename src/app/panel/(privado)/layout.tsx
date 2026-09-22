import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/panel-auth";
import { Logo } from "@/components/layout/Logo";
import { PanelNav } from "@/components/panel/PanelNav";

// Aquí se verifica de verdad la firma de la sesión. El proxy solo comprueba
// que exista la cookie, así que esta es la barrera real del panel.
export default async function PrivadoLayout({ children }: LayoutProps<"/panel">) {
  const sesion = await getSession();
  if (!sesion) redirect("/panel/acceso");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-gris bg-marfil/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/panel/citas" className="shrink-0">
            <Logo size="sm" asLink={false} />
          </Link>
          <PanelNav usuario={sesion.usuario} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
