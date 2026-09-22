import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel interno · VERITUM",
  robots: { index: false, follow: false, nocache: true },
};

// El panel vive fuera del sitio público: sin header, sin footer y sin enlaces
// desde ninguna página. La sesión se verifica en el layout de (privado).
export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return <div className="min-h-dvh bg-marfil">{children}</div>;
}
