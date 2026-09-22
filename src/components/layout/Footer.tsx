import Link from "next/link";
import { footerNav, legalNav, site } from "@content/site";
import { contact } from "@content/contact";
import { env, socialLinks } from "@/lib/env";
import { Logo } from "./Logo";
import { ContactLinks } from "./ContactLinks";

export const Footer = () => {
  const year = new Date().getFullYear();
  const hasData = Boolean(env.telefono || env.whatsapp || env.correo || env.domicilio || env.horario);

  return (
    <footer className="border-t border-blanco/10 bg-azul text-marfil">
      <div className="container-editorial pt-16 pb-10 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo inverse size="lg" />
            {/* El tagline es un elemento tipográfico independiente, nunca parte del logotipo. */}
            <p className="mt-6 max-w-sm text-balance text-marfil/80">{site.tagline}</p>
            <p className="mt-6 text-sm text-marfil/60">
              {contact.coverageLabel}: {site.coverage}
            </p>
          </div>

          <nav aria-label="Pie de página" className="md:col-span-3">
            <h2 className="eyebrow !text-dorado">Navegación</h2>
            <ul className="mt-5 space-y-3">
              {footerNav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-marfil/85 underline-offset-4 hover:text-blanco hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            {hasData && (
              <>
                <h2 className="eyebrow !text-dorado">{contact.dataTitle}</h2>
                <ContactLinks inverse className="mt-5" section="footer" />
              </>
            )}
            {socialLinks.length > 0 && (
              <>
                <h2 className="eyebrow !text-dorado mt-8">{contact.labels.redes}</h2>
                <ul className="mt-4 flex flex-wrap gap-4">
                  {socialLinks.map((s) => (
                    <li key={s.name}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-marfil/85 hover:text-blanco hover:underline">
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <h2 className="eyebrow !text-dorado mt-8">Legal</h2>
            <ul className="mt-4 space-y-2.5">
              {legalNav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-marfil/80 hover:text-blanco hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 h-px w-full bg-dorado/30" aria-hidden />

        <div className="mt-6 flex flex-col gap-4 text-sm text-marfil/65 md:flex-row md:items-start md:justify-between">
          <p className="max-w-2xl">{site.legalNotice}</p>
          <p className="shrink-0">© {year} {site.name}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
