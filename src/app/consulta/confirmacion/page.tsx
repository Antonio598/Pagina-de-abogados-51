import type { Metadata } from "next";
import { ConfirmacionEstado } from "@/components/landing/ConfirmacionEstado";

export const metadata: Metadata = {
  title: "Confirmación · VERITUM",
  robots: { index: false, follow: false },
};

export default async function ConfirmacionPage({ searchParams }: PageProps<"/consulta/confirmacion">) {
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : undefined;
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <ConfirmacionEstado sessionId={sessionId} />
    </div>
  );
}
