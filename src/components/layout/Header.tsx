"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { agendaCta, mainNav, site } from "@content/site";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { Logo } from "./Logo";
import { ButtonLink } from "@/components/ui/Button";

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

export const Header = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServices, setMobileServices] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cierra el menú al navegar (estado derivado de la ruta, sin efecto).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setServicesOpen(false);
  }

  // Menú móvil: bloqueo de scroll, Esc y trampa de foco.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("a, button")?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  const openServices = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const closeServices = () => {
    closeTimer.current = window.setTimeout(() => setServicesOpen(false), 120);
  };

  const onAgendaClick = () => track("cta_agenda", { section: "header", element_id: "header_agenda" });

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-brand focus:bg-azul focus:px-4 focus:py-2 focus:text-blanco"
      >
        Saltar al contenido
      </a>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300 ease-brand",
          scrolled || open
            ? "border-b border-gris bg-marfil/90 shadow-[0_1px_0_rgb(13_34_76/0.03)] backdrop-blur-md"
            : "border-b border-transparent bg-marfil/0",
        )}
      >
        <div
          className={cn(
            "container-editorial flex items-center justify-between gap-2 transition-[height] duration-300 ease-brand sm:gap-3",
            scrolled ? "h-16" : "h-[68px] md:h-[76px]",
          )}
        >
          <Logo size={scrolled ? "sm" : "md"} priority />

          {/* Navegación de escritorio */}
          <nav aria-label="Principal" className="hidden xl:block">
            <ul className="flex items-center gap-6">
              {mainNav.map((item) =>
                item.children ? (
                  <li key={item.href} className="relative" onMouseEnter={openServices} onMouseLeave={closeServices}>
                    <button
                      type="button"
                      className={cn(
                        "underline-grow inline-flex items-center gap-1 whitespace-nowrap py-2 text-[0.95rem] font-medium text-azul",
                        isActive(pathname, item.href) && "text-azul-2",
                      )}
                      aria-expanded={servicesOpen}
                      aria-haspopup="true"
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      onClick={() => setServicesOpen((v) => !v)}
                      onKeyDown={(e) => e.key === "Escape" && setServicesOpen(false)}
                    >
                      {item.label}
                      <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-200", servicesOpen && "rotate-180")} strokeWidth={1.75} />
                    </button>
                    {servicesOpen && (
                      <div className="anim-rise absolute left-1/2 top-full z-50 w-[22rem] -translate-x-1/2 pt-3 [animation-duration:200ms]">
                        <div className="overflow-hidden rounded-brand border border-gris bg-blanco p-2 shadow-card-hover">
                          <Link href={item.href} className="block rounded-brand px-4 py-2.5 text-[0.9rem] font-medium text-azul hover:bg-marfil" onClick={() => setServicesOpen(false)}>
                            Todos los servicios
                          </Link>
                          <div className="gold-rule my-1" />
                          {item.children.map((c) => (
                            <Link
                              key={c.href}
                              href={c.href}
                              className="group flex items-center justify-between rounded-brand px-4 py-2.5 text-[0.95rem] text-carbon hover:bg-marfil hover:text-azul"
                              onClick={() => setServicesOpen(false)}
                            >
                              <span>{c.label}</span>
                              <span className="text-xs uppercase tracking-widest text-dorado-2 opacity-0 transition-opacity group-hover:opacity-100">{c.short}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn("underline-grow whitespace-nowrap py-2 text-[0.95rem] font-medium text-azul", isActive(pathname, item.href) && "text-azul-2")}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            {/* "Agenda asesoría" siempre visible, también en móvil (mín. 40 px de alto). */}
            <ButtonLink href={agendaCta.href} size="sm" onClick={onAgendaClick} className="cta-destello h-10 whitespace-nowrap px-3 py-0 text-[0.85rem] sm:px-5 sm:text-[0.9375rem]">
              {agendaCta.label}
            </ButtonLink>
            <button
              ref={toggleRef}
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-brand text-azul hover:bg-azul/5 xl:hidden"
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X aria-hidden strokeWidth={1.75} /> : <Menu aria-hidden strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil / tableta. Vive fuera del <header>: backdrop-filter crearía un bloque contenedor para position:fixed. */}
      {open && (
        <div
          id="menu-movil"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
          className="anim-fade fixed inset-0 z-40 overflow-y-auto bg-marfil pb-safe pt-[68px] [animation-duration:220ms] md:pt-[76px] xl:hidden"
        >
          <nav aria-label="Principal móvil" className="container-editorial py-4">
            <ul className="flex flex-col">
              {mainNav.map((item, i) => (
                <li key={item.href} className="anim-slide-x border-b border-gris [animation-duration:250ms]" style={{ ["--d" as string]: `${40 * i}ms` } as React.CSSProperties}>
                  {item.children ? (
                    <>
                      <div className="flex items-center justify-between">
                        <Link href={item.href} className="flex-1 py-4 text-lg font-medium text-azul" aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          className="inline-flex size-12 items-center justify-center rounded-brand text-azul"
                          aria-expanded={mobileServices}
                          aria-label={mobileServices ? "Ocultar servicios" : "Mostrar servicios"}
                          onClick={() => setMobileServices((v) => !v)}
                        >
                          <ChevronDown aria-hidden className={cn("size-5 transition-transform", mobileServices && "rotate-180")} strokeWidth={1.75} />
                        </button>
                      </div>
                      <div className="acc-panel" data-open={mobileServices ? "" : undefined}>
                        <ul className="pb-2 pl-4">
                          {item.children.map((c) => (
                            <li key={c.href}>
                              <Link href={c.href} className="block py-3 text-base text-carbon hover:text-azul" tabIndex={mobileServices ? 0 : -1}>
                                <span className="mr-2 inline-block h-px w-4 bg-dorado align-middle" aria-hidden />
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link href={item.href} className="block py-4 text-lg font-medium text-azul" aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-carbon/70">{site.tagline}</p>
          </nav>
        </div>
      )}
      {/* Espaciador para que el header fijo no tape contenido. */}
      <div aria-hidden className="h-[68px] md:h-[76px]" />
    </>
  );
};
