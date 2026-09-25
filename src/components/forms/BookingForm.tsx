"use client";

// Formulario de reserva con pago, compartido por la landing (/consulta/agendar)
// y por el sitio (/agenda). Pasos: servicio → horario → datos → pago.
//
// El precio que se muestra viene del servidor; el servidor lo vuelve a calcular
// al cobrar a partir del id de servicio, así que manipularlo en el navegador no
// sirve de nada.
//
// Cada servicio tiene su propia anticipación mínima: al cambiar de servicio se
// vuelve a pedir la agenda y se borra el horario elegido, porque un hueco válido
// para la asesoría puede caer dentro de las 48 h que el prioritario no ofrece.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CalendarDays, Check, Clock, FileUp, Info, Loader2, ShieldCheck, Video } from "lucide-react";
import { asuntoOptions, contactForm as cf } from "@content/contact";
import { site } from "@content/site";
import { situaciones, type ProductoId } from "@content/productos";
import type { ProductoVista } from "@/lib/productos-vista";
import { reservaSchema, type ReservaInput } from "@/lib/validation";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Select, Textarea } from "./Field";

type Slot = { start: string; end: string; label: string };
type Dia = { date: string; slots: Slot[] };

type Props = {
  origen: "landing" | "sitio";
  /** Catálogo que este formulario puede vender. */
  productos: ProductoVista[];
  productoInicial: ProductoId;
  /** El sitio de marketing vende un solo servicio y no muestra el selector. */
  mostrarSelector?: boolean;
  /** Situación del patrón preseleccionada desde la landing. */
  situacionInicial?: string;
  defaultAsunto?: string;
  className?: string;
};

const diaCorto = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  return {
    semana: new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(d).replace(".", ""),
    dia: new Intl.DateTimeFormat("es-MX", { day: "numeric" }).format(d),
    mes: new Intl.DateTimeFormat("es-MX", { month: "short" }).format(d).replace(".", ""),
  };
};

/** UTM guardadas al llegar desde un anuncio (sessionStorage). */
const leerUtm = (): Record<string, string> => {
  try {
    return JSON.parse(window.sessionStorage.getItem("veritum_utm") ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
};

const Circulo = ({ n }: { n: number }) => (
  <span className="flex size-8 items-center justify-center rounded-full border border-dorado text-sm tabular-nums">{n}</span>
);

/**
 * ¿La fecha relevante del asunto llega antes de que este servicio pueda
 * atenderse? Vive fuera del componente porque usa Date.now(), que no puede
 * llamarse durante el render: se evalúa solo desde los manejadores de eventos.
 */
const esDemasiadoPronto = (fecha: string, leadMinutos: number) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  return new Date(`${fecha}T23:59:59`).getTime() < Date.now() + leadMinutos * 60_000;
};

const diaLargo = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${iso}T12:00:00`));

export const BookingForm = ({
  origen,
  productos,
  productoInicial,
  mostrarSelector = false,
  situacionInicial,
  defaultAsunto,
  className,
}: Props) => {
  const [productoId, setProductoId] = useState<ProductoId>(productoInicial);
  const [dias, setDias] = useState<Dia[] | null>(null);
  const [cargaError, setCargaError] = useState<string | null>(null);
  const [diaActivo, setDiaActivo] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [paso, setPaso] = useState<1 | 2>(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fechaUrgente, setFechaUrgente] = useState("");
  // Se guarda el resultado, no se calcula al pintar: la comparación necesita la
  // hora actual y eso no puede ocurrir durante el render.
  const [fechaDemasiadoPronto, setFechaDemasiadoPronto] = useState(false);

  const producto = productos.find((p) => p.id === productoId) ?? productos[0];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReservaInput>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      // En la landing el área es siempre laboral y no se le pregunta al cliente.
      asunto: (mostrarSelector
        ? "laboral"
        : asuntoOptions.some((o) => o.value === defaultAsunto)
          ? defaultAsunto
          : undefined) as ReservaInput["asunto"],
      producto: productoInicial,
      situacion: (situaciones.some((s) => s.id === situacionInicial) ? situacionInicial : undefined) as ReservaInput["situacion"],
      origen,
      empresa_web: "",
    },
    mode: "onBlur",
  });

  // Carga de horarios para el servicio elegido. El estado se actualiza siempre
  // dentro de una promesa, nunca de forma síncrona dentro del efecto.
  const cargar = useCallback(
    (id: ProductoId, activo: () => boolean = () => true) =>
      fetch(`/api/reservas/disponibilidad?producto=${encodeURIComponent(id)}`, { cache: "no-store" })
        .then((res) => res.json() as Promise<{ ok: boolean; dias?: Dia[]; error?: string }>)
        .then((json) => {
          if (!activo()) return;
          if (!json.ok || !json.dias) throw new Error(json.error ?? "error");
          const conCupo = json.dias.filter((d) => d.slots.length > 0);
          setCargaError(null);
          setDias(conCupo);
          setDiaActivo(conCupo[0]?.date ?? null);
        })
        .catch(() => {
          if (!activo()) return;
          setCargaError("No pudimos cargar los horarios. Recarga la página o escríbenos por los canales de contacto.");
          setDias([]);
        }),
    [],
  );

  useEffect(() => {
    let vivo = true;
    void cargar(productoId, () => vivo);
    return () => {
      vivo = false;
    };
  }, [cargar, productoId]);

  const elegirProducto = (id: ProductoId) => {
    if (id === productoId) return;
    setProductoId(id);
    setValue("producto", id, { shouldValidate: true });
    // El horario elegido puede no ser válido para el servicio nuevo.
    setSlot(null);
    setValue("slot", "", { shouldValidate: false });
    setDias(null);
    setPaso(1);
    setError(null);
    const nuevo = productos.find((p) => p.id === id);
    setFechaDemasiadoPronto(
      Boolean(fechaUrgente) && esDemasiadoPronto(fechaUrgente, nuevo?.leadMinutos ?? 0),
    );
  };

  const elegirSlot = (s: Slot) => {
    setSlot(s);
    setValue("slot", s.start, { shouldValidate: true });
    setError(null);
    track("agenda_iniciada", { section: origen, result: "iniciado" }, { once: `agenda_iniciada_${origen}` });
    setPaso(2);
    queueMicrotask(() => document.getElementById("datos-reserva")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const onSubmit = async (values: ReservaInput) => {
    setEnviando(true);
    setError(null);
    const utm = leerUtm();

    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, producto: productoId, origen, utm }),
      });
      const json = (await res.json()) as { ok: boolean; url?: string; error?: string; campo?: string };
      if (!res.ok || !json.ok || !json.url) {
        setError(json.error ?? "No pudimos iniciar el pago. Inténtalo de nuevo.");
        setEnviando(false);
        if (json.campo === "slot") {
          setSlot(null);
          setPaso(1);
          void cargar(productoId);
        }
        return;
      }
      track("pago_iniciado", { section: origen, result: "iniciado" });
      window.location.assign(json.url);
    } catch {
      setError("No pudimos iniciar el pago. Revisa tu conexión e inténtalo de nuevo.");
      setEnviando(false);
    }
  };

  const diaSel = dias?.find((d) => d.date === diaActivo);

  const numeroPaso = mostrarSelector ? { horario: 2, datos: 3 } : { horario: 1, datos: 2 };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn("relative space-y-8", className)}>
      {/* Honeypot */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="reserva_empresa_web">No completar este campo</label>
        <input id="reserva_empresa_web" type="text" tabIndex={-1} autoComplete="off" {...register("empresa_web")} />
      </div>

      {/* El id de servicio viaja en el formulario; el precio lo pone el servidor. */}
      <input type="hidden" {...register("producto")} />

      {/* Paso 1 — servicio (solo en la landing) */}
      {mostrarSelector && (
        <fieldset aria-labelledby="paso-servicio">
          <legend id="paso-servicio" className="font-display type-h3 flex items-center gap-3 text-azul">
            <Circulo n={1} />
            Elige tu servicio
          </legend>

          <div className="mt-6 grid gap-3">
            {productos.map((p) => {
              const sel = p.id === productoId;
              return (
                <label
                  key={p.id}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-brand border p-4 transition-colors duration-200",
                    sel ? "border-azul bg-azul/[0.03]" : "border-gris bg-blanco hover:border-azul/40",
                  )}
                >
                  <input
                    type="radio"
                    name="servicio-visible"
                    value={p.id}
                    checked={sel}
                    onChange={() => elegirProducto(p.id)}
                    className="mt-1 size-4 shrink-0 accent-[#0d224c]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="font-medium text-azul">{p.nombre}</span>
                      <span className="font-display text-lg leading-none tabular-nums text-azul">{p.etiqueta}</span>
                    </span>
                    <span className="mt-1.5 block text-[0.92rem] text-carbon/80">{p.resumen}</span>
                    {p.requiereDocumentos && (
                      <span className="mt-2 flex items-center gap-1.5 text-xs text-carbon/75">
                        <FileUp className="size-3.5 shrink-0 text-dorado-2" aria-hidden />
                        Cargas tu documentación en tu portal al confirmar el pago.
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>

          {producto.aviso && (
            <p className="mt-3 flex gap-2 rounded-brand border border-dorado/40 bg-marfil p-4 text-[0.92rem] text-carbon/90">
              <Info className="mt-0.5 size-4 shrink-0 text-dorado-2" strokeWidth={1.75} aria-hidden />
              <span>{producto.aviso}</span>
            </p>
          )}
        </fieldset>
      )}

      {/* Paso 2 — horario */}
      <section aria-labelledby="paso-horario">
        <h2 id="paso-horario" className="font-display type-h3 flex items-center gap-3 text-azul">
          <Circulo n={numeroPaso.horario} />
          Elige tu horario
        </h2>

        {dias === null && (
          <p className="mt-6 flex items-center gap-2 text-carbon/70">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Cargando horarios disponibles…
          </p>
        )}

        {cargaError && (
          <p role="alert" className="mt-6 rounded-brand border border-[#b23b3b]/40 bg-[#fbf2f2] p-4 text-sm text-[#6d2323]">
            {cargaError}
          </p>
        )}

        {dias !== null && dias.length === 0 && !cargaError && (
          <p className="mt-6 rounded-brand border border-gris bg-marfil p-4 text-carbon/85">
            En este momento no hay horarios abiertos para este servicio.{" "}
            <Link href="/contacto" className="link-text !underline">
              Escríbenos
            </Link>{" "}
            y te avisamos en cuanto se liberen.
          </p>
        )}

        {dias !== null && dias.length > 0 && (
          <>
            <div className="mt-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-azul">
                <CalendarDays className="size-4 text-dorado-2" aria-hidden /> Día
              </p>
              <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
                {dias.map((d) => {
                  const sel = d.date === diaActivo;
                  const { semana, dia, mes } = diaCorto(d.date);
                  return (
                    <button
                      key={d.date}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => {
                        setDiaActivo(d.date);
                        setSlot(null);
                      }}
                      className={cn(
                        "flex min-w-16 shrink-0 snap-start flex-col items-center rounded-brand border px-3 py-2.5 transition-colors duration-200",
                        sel ? "border-azul bg-azul text-blanco" : "border-gris bg-blanco text-azul hover:border-azul/40",
                      )}
                    >
                      <span className="text-[0.7rem] uppercase tracking-wider opacity-80">{semana}</span>
                      <span className="font-display text-xl leading-tight">{dia}</span>
                      <span className="text-[0.7rem] uppercase tracking-wider opacity-80">{mes}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-azul">
                <Clock className="size-4 text-dorado-2" aria-hidden /> Hora · sesión de hasta {producto.duracionMinutos} minutos
                <span className="inline-flex items-center gap-1.5 rounded-full bg-marfil px-2.5 py-1 text-xs font-normal text-carbon/80">
                  <Video className="size-3.5 text-dorado-2" aria-hidden />
                  {site.modalidad}
                </span>
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {diaSel?.slots.map((s) => {
                  const sel = slot?.start === s.start;
                  return (
                    <button
                      key={s.start}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => elegirSlot(s)}
                      className={cn(
                        "min-h-11 rounded-brand border text-[0.95rem] tabular-nums transition-colors duration-200",
                        sel ? "border-azul bg-azul text-blanco" : "border-gris bg-blanco text-azul hover:border-dorado/60",
                      )}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
              {errors.slot && !slot && (
                <p role="alert" className="mt-3 text-sm text-[#8a2f2f]">
                  {errors.slot.message}
                </p>
              )}
            </div>
          </>
        )}
      </section>

      {/* Paso 3 — datos */}
      {paso === 2 && slot && (
        <section id="datos-reserva" aria-labelledby="paso-datos" className="anim-rise space-y-6 [animation-duration:300ms]">
          <h2 id="paso-datos" className="font-display type-h3 flex items-center gap-3 text-azul">
            <Circulo n={numeroPaso.datos} />
            Tus datos
          </h2>

          <p className="flex flex-wrap items-center gap-2 rounded-brand border border-dorado/40 bg-marfil px-4 py-3 text-[0.95rem] text-carbon/90">
            <Check className="size-4 text-dorado-2" aria-hidden />
            <span>
              {diaLargo(diaActivo!)} · <strong className="tabular-nums">{slot.label} h</strong>
            </span>
            <button type="button" onClick={() => setPaso(1)} className="link-text ml-auto !underline text-sm">
              Cambiar
            </button>
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input id="r-nombre" label={cf.fields.nombre} autoComplete="name" error={errors.nombre?.message} {...register("nombre")} />
            <Input id="r-correo" label={cf.fields.correo} type="email" autoComplete="email" inputMode="email" error={errors.correo?.message} {...register("correo")} />
            <Input id="r-telefono" label={cf.fields.telefono} type="tel" autoComplete="tel" inputMode="tel" placeholder="+52 55 0000 0000" hint={cf.fields.telefonoHint} error={errors.telefono?.message} {...register("telefono")} />
            {mostrarSelector ? (
              <Select
                id="r-situacion"
                label="Tu situación"
                options={situaciones.map((s) => ({ value: s.id, label: s.titulo }))}
                placeholder="Selecciona una opción"
                error={errors.situacion?.message}
                {...register("situacion")}
              />
            ) : (
              <Select id="r-asunto" label={cf.fields.asunto} options={asuntoOptions} placeholder="Selecciona una opción" error={errors.asunto?.message} {...register("asunto")} />
            )}
          </div>

          <Textarea
            id="r-descripcion"
            label={cf.fields.descripcion}
            optional
            rows={4}
            maxLength={cf.maxChars}
            hint="Unas líneas bastan. En la sesión revisamos el detalle."
            error={errors.descripcion?.message}
            {...register("descripcion")}
          />

          <Input
            id="r-urgente"
            label={mostrarSelector ? "Fecha de tu audiencia o del plazo que corre" : cf.fields.fecha}
            type="date"
            optional
            hint={mostrarSelector ? "Si tienes una fecha encima, dínosla: cambia lo que conviene hacer." : cf.fields.fechaHint}
            error={errors.urgente?.message}
            {...register("urgente", {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const v = e.target.value;
                setFechaUrgente(v);
                setFechaDemasiadoPronto(Boolean(v) && esDemasiadoPronto(v, producto.leadMinutos));
              },
            })}
          />

          {fechaDemasiadoPronto && (
            <p role="alert" className="flex gap-2 rounded-brand border border-dorado bg-marfil p-4 text-[0.92rem] text-carbon/90">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-dorado-2" strokeWidth={1.75} aria-hidden />
              <span>
                Esa fecha llega antes de que podamos atenderte con este servicio. No queremos cobrarte algo que no llegaría a
                tiempo:{" "}
                <Link href="/contacto" className="link-text !underline">
                  escríbenos
                </Link>{" "}
                y vemos qué se puede hacer hoy.
              </span>
            </p>
          )}

          <Checkbox
            id="r-terminos"
            error={errors.terminos?.message}
            label={
              <>
                Acepto los{" "}
                <Link href="/terminos-de-uso" target="_blank" className="link-text !underline">
                  términos de uso
                </Link>{" "}
                y el{" "}
                <Link href="/aviso-de-privacidad" target="_blank" className="link-text !underline">
                  aviso de privacidad
                </Link>
                .
              </>
            }
            {...register("terminos")}
          />

          {/* Pago */}
          <div className="rounded-brand border border-gris bg-blanco p-5 shadow-card">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Total a pagar</p>
                <p className="font-display mt-1 text-[1.9rem] leading-none text-azul">{producto.etiqueta}</p>
                <p className="mt-1 text-sm text-carbon/75">{producto.nombre}</p>
              </div>
            </div>

            <p className="mt-4 flex gap-2 rounded-brand bg-marfil p-3 text-[0.88rem] text-carbon/85">
              <Check className="mt-0.5 size-4 shrink-0 text-dorado-2" strokeWidth={2} aria-hidden />
              <span>
                Si contratas a VERITUM para llevar tu caso y el despacho acepta la representación, este importe se descuenta
                de los honorarios, conforme a las condiciones de contratación.
              </span>
            </p>

            {error && (
              <p role="alert" className="mt-4 flex gap-2 rounded-brand border border-[#b23b3b]/40 bg-[#fbf2f2] p-3 text-sm text-[#6d2323]">
                <AlertTriangle className="size-4 shrink-0" aria-hidden />
                {error}
              </p>
            )}

            <Button type="submit" size="lg" arrow disabled={enviando} className="mt-5 w-full">
              {enviando ? "Abriendo el pago seguro…" : "Pagar y confirmar mi cita"}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-carbon/70">
              <ShieldCheck className="size-4 text-dorado-2" aria-hidden />
              Pago seguro con Stripe. Tu cita queda confirmada al registrarse el pago.
            </p>
          </div>
        </section>
      )}
    </form>
  );
};
