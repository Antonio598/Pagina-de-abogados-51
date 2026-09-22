import type { MetadataRoute } from "next";
import { services } from "@content/services";
import { resources } from "@content/library";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.siteUrl;
  const now = new Date();
  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/quienes-somos`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/proceso`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/estrategia-preventiva`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/biblioteca`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
  ];
  const svc = services.map((s) => ({ url: `${base}/servicios/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 }));
  const lib = resources.map((r) => ({ url: `${base}/biblioteca/${r.slug}`, lastModified: new Date(r.updatedAt), changeFrequency: "monthly" as const, priority: 0.7 }));
  return [...statics, ...svc, ...lib];
}
