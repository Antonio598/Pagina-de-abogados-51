"use client";

// Formulario de reserva con pago, compartido por la landing (/consulta/agendar)
// y por el sitio (/agenda). Tres pasos: horario → datos → pago.
// El precio que se muestra viene del servidor; el servidor lo vuelve a calcular
// al cobrar, así que manipularlo en el navegador no sirve de nada.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CalendarDays, Check, Clock, Loader2, ShieldCheck } from "lucide-react";
import { asuntoOptions, contactForm as cf } from "@content/contact";
import { reservaSchema, type ReservaInput } from "@/lib/validation";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Select, Textarea } from "./Field";

export type PrecioVista = {
  centavos: number;
  normalCentavos: number;
  conDescuento: boolean;
  moneda: string;
  etiqueta: string;
  etiquetaNormal: string;
};

type Slot = { start: string; end: string; label: string };
type Dia = { date: string; slots: Slot[] };

type Props = {
  origen: "landing" | "sitio";
  precio: PrecioVista;
  defaultAsunto?: string;
  duracionMinutos: number;
  /** Texto legal que debe aceptarse (aviso previo ya mostrado en el paso anterior). */
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

const diaLargo = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${iso}T12:00:00`));

export const BookingForm = ({ origen, precio, defaultAsunto, duracionMinutos, className }: Props) => {
  const [dias, setDias] = useState<Dia[] | null>(null);
  const [cargaError, setCargaError] = useState<string | null>(null);
  const [diaActivo, setDiaActivo] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [paso, setPaso] = useState<1 | 2>(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReservaInput>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      asunto: (asuntoOptions.some((o) => o.value === defaultAsunto) ? defaultAsunto : undefined) as ReservaInput["asunto"],
      origen,
      empresa_web: "",
    },
    mode: "onBlur",
  });

  // Carga de horarios. El estado se actualiza siempre dentro de una promesa,
  // nunca de forma síncrona dentro del efecto.
  const cargar = useCallback(
    (activo: () => boolean = () => true) =>
      fetch("/api/reservas/disponibilidad", { cache: "no-store" })
        .then((res) => res.json() as Promise<{ ok: boolean; dias?: Dia[]; error?: string }>)
        .then((json) => {
          if (!activo()) return;
          if (!json.ok || !json.dias) throw new Error(json.error ?? "error");
          const conCupo = json.dias.filter((d) => d.slots.length > 0);
          setCargaError(null);
          setDias(conCupo);
          setDiaActivo((prev) => prev ?? conCupo[0]?.date ?? null);
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
    void cargar(() => vivo);
    return () => {
      vivo = false;
    };
  }, [cargar]);

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
        body: JSON.stringify({ ...values, origen, utm }),
      });
      const json = (await res.json()) as { ok: boolean; url?: string; error?: string; campo?: string };
      if (!res.ok || !json.ok || !json.url) {
        setError(json.error ?? "No pudimos iniciar el pago. Inténtalo de nuevo.");
        setEnviando(false);
        if (json.campo === "slot") {
          setSlot(null);
          setPaso(1);
          void cargar();
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn("relative space-y-8", className)}>
      {/* Honeypot */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="reserva_empresa_web">No completar este campo</label>
        <input id="reserva_empresa_web" type="text" tabIndex={-1} autoComplete="off" {...register("empresa_web")} />
      </div>

      {/* Paso 1 — horario */}
      <section aria-labelledby="paso-horario">
        <h2 id="paso-horario" className="font-display type-h3 flex items-center gap-3 text-azul">
          <span className="flex size-8 items-center justify-center rounded-full border border-dorado text-sm tabular-nums">1</span>
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
            En este momento no hay horarios abiertos.{" "}
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
              <p className="mb-3 flex items-center gap-2 text-sm font-medium text-azul">
                <Clock className="size-4 text-dorado-2" aria-hidden /> Hora · sesión de {duracionMinutos} minutos
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

      {/* Paso 2 — datos */}
      {paso === 2 && slot && (
        <section id="datos-reserva" aria-labelledby="paso-datos" className="anim-rise space-y-6 [animation-duration:300ms]">
          <h2 id="paso-datos" className="font-display type-h3 flex items-center gap-3 text-azul">
            <span className="flex size-8 items-center justify-center rounded-full border border-dorado text-sm tabular-nums">2</span>
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
            <Select id="r-asunto" label={cf.fields.asunto} options={asuntoOptions} placeholder="Selecciona una opción" error={errors.asunto?.message} {...register("asunto")} />
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

          <Input id="r-urgente" label={cf.fields.fecha} type="date" optional hint={cf.fields.fechaHint} error={errors.urgente?.message} {...register("urgente")} />

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

          {/* Paso 3 — pago */}
          <div className="rounded-brand border border-gris bg-blanco p-5 shadow-card">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Total a pagar</p>
                <p className="font-display mt-1 text-[1.9rem] leading-none text-azul">{precio.etiqueta}</p>
              </div>
              {precio.conDescuento && (
                <p className="text-right text-sm text-carbon/70">
                  <span className="line-through">{precio.etiquetaNormal}</span>
                  <br />
                  <span className="font-medium text-dorado-2">precio con descuento</span>
                </p>
              )}
            </div>

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
