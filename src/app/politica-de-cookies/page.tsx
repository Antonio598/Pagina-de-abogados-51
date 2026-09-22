import type { Metadata } from "next";
import { getLegal } from "@content/legal";
import { seo } from "@content/seo";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: seo.cookies.title,
  description: seo.cookies.description,
  alternates: { canonical: "/politica-de-cookies" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LegalPage doc={getLegal("politica-de-cookies")!} />;
}
