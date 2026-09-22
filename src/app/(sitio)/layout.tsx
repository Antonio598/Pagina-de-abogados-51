import { organizationSchema } from "@/lib/schema";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/layout/Analytics";
import { JsonLd } from "@/components/ui/JsonLd";

// Envoltura del sitio público. La landing (/consulta) y el panel (/panel)
// tienen su propio layout y no heredan este header ni este pie.
export default function SitioLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <Header />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer />
      <Analytics />
    </>
  );
}
