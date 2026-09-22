import type { Metadata } from "next";
import { getLegal } from "@content/legal";
import { seo } from "@content/seo";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: seo.privacidad.title,
  description: seo.privacidad.description,
  alternates: { canonical: "/aviso-de-privacidad" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LegalPage doc={getLegal("aviso-de-privacidad")!} />;
}
