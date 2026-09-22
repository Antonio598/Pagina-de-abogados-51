// Datos estructurados (JSON-LD). Solo información verificable: nombre, área,
// URL y contenido publicado. Sin cifras, reseñas ni datos no confirmados.
import { env } from "@/lib/env";
import { site } from "@content/site";
import type { Faq } from "@content/faqs";

const org = {
  "@type": "LegalService",
  "@id": `${env.siteUrl}/#organization`,
  name: site.name,
  alternateName: `${site.name} ${site.descriptor}`,
  slogan: site.tagline,
  url: env.siteUrl,
  areaServed: ["Ciudad de México", "Estado de México"],
  ...(env.telefono ? { telephone: env.telefono } : {}),
  ...(env.correo ? { email: env.correo } : {}),
};

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  ...org,
});

export const serviceSchema = (opts: { name: string; description: string; url: string }) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: opts.name,
  description: opts.description,
  url: opts.url,
  serviceType: "Asesoría legal",
  areaServed: org.areaServed,
  provider: { "@id": org["@id"] },
});

export const faqSchema = (faqs: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export const articleSchema = (opts: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  author: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: opts.title,
  description: opts.description,
  url: opts.url,
  datePublished: opts.datePublished,
  dateModified: opts.dateModified,
  author: { "@type": "Organization", name: opts.author },
  publisher: { "@id": org["@id"] },
  inLanguage: "es-MX",
});

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: it.url,
  })),
});
