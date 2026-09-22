import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "@/components/panel/LoginForm";
import { getSession, panelConfigurado } from "@/lib/panel-auth";

export default async function AccesoPage({ searchParams }: PageProps<"/panel/acceso">) {
  const sp = await searchParams;
  const desde = typeof sp.desde === "string" ? sp.desde : undefined;
  if (await getSession()) redirect("/panel/citas");

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Logo asLink={false} />
          <p className="eyebrow mt-6">Panel interno</p>
        </div>
        <div className="mt-6 rounded-brand border border-gris bg-blanco p-6 shadow-card">
          {panelConfigurado() ? (
            <LoginForm desde={desde} />
          ) : (
            <p className="text-sm text-carbon/85">
              El panel aún no está configurado. Define <code className="text-azul">PANEL_USER</code>,{" "}
              <code className="text-azul">PANEL_PASSWORD_HASH</code> y <code className="text-azul">PANEL_SESSION_SECRET</code> en el entorno.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
