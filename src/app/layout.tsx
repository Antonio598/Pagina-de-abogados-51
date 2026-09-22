import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { seo } from "@content/seo";
import { site } from "@content/site";
import { env } from "@/lib/env";
import { organizationSchema } from "@/lib/schema";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics } from "@/components/layout/Analytics";
import { JsonLd } from "@/components/ui/JsonLd";

// Dos familias como máximo: Inter (cuerpo/UI) y Fraunces (títulos de primer nivel).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: seo.home.title, template: "%s" },
  description: seo.home.description,
  applicationName: site.name,
  openGraph: { type: "website", locale: "es_MX", siteName: site.name },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#F7F4ED",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" className={`${inter.variable} ${fraunces.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {/* Sin JavaScript, los bloques con animación de entrada se muestran de inmediato. */}
        <noscript>
          <style>{`[style*="opacity"]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <JsonLd data={organizationSchema()} />
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
