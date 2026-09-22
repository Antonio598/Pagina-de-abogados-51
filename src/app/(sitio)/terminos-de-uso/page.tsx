import type { Metadata } from "next";
import { getLegal } from "@content/legal";
import { seo } from "@content/seo";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: seo.terminos.title,
  description: seo.terminos.description,
  alternates: { canonical: "/terminos-de-uso" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LegalPage doc={getLegal("terminos-de-uso")!} />;
}
