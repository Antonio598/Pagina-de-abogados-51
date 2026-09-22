"use client";

// Flujo de agenda (Bloque 6): 0) aviso previo obligatorio → 1) datos de la
// reserva → 2) confirmación. Sin proveedor de agenda configurado, la solicitud
// se envía por la API de contacto con tipo "agenda" y VERITUM confirma por correo.
// Con NEXT_PUBLIC_AGENDA_URL definido, el paso 1 enlaza al proveedor autorizado.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CalendarCheck, CheckCircle2, ExternalLink, Info } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { agenda, asuntoOptions, contactForm as cf } from "@content/contact";
import { env } from "@/lib/env";
import { agendaSchema, type AgendaInput } from "@/lib/validation";
import { track } from "@/lib/analytics";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DrawLine } from "@/components/motion/Reveal";
import { Checkbox, Input, Select } from "./Field";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const Steps = ({ current }: { current: number }) => (
  <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" aria-label="Pasos de la reserva">
    {agenda.steps.map((s, i) => (
      <li key={s} className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full border font-display text-xs tabular-nums transition-colors",
            i < current ? "border-dorado bg-dorado/15 text-azul" : i === current ? "border-azul bg-azul text-blanco" : "border-gris text-carbon/50",
          )}
          aria-current={i === current ? "step" : undefined}
        >
          {i + 1}
        </span>
        <span className={cn(i === current ? "font-medium text-azul" : "text-carbon/60")}>{s}</span>
        {i < agenda.steps.length - 1 && <span className="hidden h-px w-6 bg-gris sm:block" aria-hidden />}
      </li>
    ))}
  </ol>
);

export const AgendaFlow = ({ defaultAsunto }: { defaultAsunto?: string }) => {
  const [step, setStep] = useState(0);
  const [ack, setAck] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AgendaInput>({
    resolver: zodResolver(agendaSchema),
    defaultValues: {
      asunto: (asuntoOptions.some((o) => o.value === defaultAsunto) ? defaultAsunto : undefined) as AgendaInput["asunto"],
      modalidad: env.modalidadesAgenda[0] ?? "",
      empresa_web: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (step === 1) track("agenda_iniciada", { section: "agenda", result: "iniciado" }, { once: "agenda_iniciada" });
  }, [step]);

  const onSubmit = async (values: AgendaInput) => {
    setStatus("sending");
    setServerError(null);
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, tipo: "agenda" }),
      });
      const json = (await res.json()) as { ok: boolean; id?: string; error?: string; fields?: Record<string, string> };
      if (!res.ok || !json.ok) {
        if (json.fields) for (const [k, msg] of Object.entries(json.fields)) setError(k as keyof AgendaInput, { message: msg });
        setServerError(json.error ?? cf.errorText);
        setStatus("error");
        track("agenda_confirmada", { section: "agenda", result: "error" });
        return;
      }
      track("agenda_confirmada", { section: "agenda", result: "completado", modality: values.modalidad }, { once: `agenda:${json.id ?? "sent"}` });
      setStatus("idle");
      setStep(2);
    } catch {
      setServerError(cf.errorText);
      setStatus("error");
      track("agenda_confirmada", { section: "agenda", result: "error" });
    }
  };

  const panel = (key: string, children: React.ReactNode) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -8 }}
      transition={{ duration: reduced ? 0.15 : 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="rounded-brand border border-gris bg-blanco p-6 shadow-card md:p-10">
      <Steps current={step} />
      <DrawLine className="my-8" />

      <AnimatePresence mode="wait">
        {step === 0 &&
          panel(
            "aviso",
            <div>
              <div className="flex gap-4 rounded-brand border border-dorado/40 bg-marfil p-5 md:p-6">
                <Info className="mt-1 size-6 shrink-0 text-dorado-2" strokeWidth={1.5} aria-hidden />
                <p className="text-carbon/90">{agenda.notice}</p>
              </div>
              <Checkbox id="ack" label={agenda.ack} checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-6" />
              <Button className="mt-8" size="lg" arrow disabled={!ack} onClick={() => setStep(1)}>
                {agenda.continueLabel}
              </Button>
            </div>,
          )}

        {step === 1 &&
          panel(
            "datos",
            env.agendaUrl ? (
              // Proveedor de agenda autorizado: se enlaza sin embeber scripts de terceros sin consentimiento.
              <div>
                <h2 className="font-display type-h2 text-azul">{agenda.detailsTitle}</h2>
                <p className="mt-3 text-carbon/80">{cf.afterSubmit}</p>
                <ButtonLink
                  href={env.agendaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  className="mt-8"
                  onClick={() => track("agenda_iniciada", { section: "agenda", result: "completado", element_id: "external_provider" })}
                >
                  {agenda.externalLabel}
                  <ExternalLink className="size-4" strokeWidth={1.75} aria-hidden />
                </ButtonLink>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-6">
                <h2 className="font-display type-h2 text-azul">{agenda.detailsTitle}</h2>

                <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
                  <label htmlFor="agenda_empresa_web">No completar este campo</label>
                  <input id="agenda_empresa_web" type="text" tabIndex={-1} autoComplete="off" {...register("empresa_web")} />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <Input id="a-nombre" label={cf.fields.nombre} autoComplete="name" error={errors.nombre?.message} {...register("nombre")} />
                  <Input id="a-correo" label={cf.fields.correo} type="email" autoComplete="email" error={errors.correo?.message} {...register("correo")} />
                  <Input id="a-telefono" label={cf.fields.telefono} type="tel" autoComplete="tel" placeholder="+52 55 0000 0000" hint={cf.fields.telefonoHint} error={errors.telefono?.message} {...register("telefono")} />
                  <Select id="a-asunto" label={cf.fields.asunto} options={asuntoOptions} placeholder="Selecciona una opción" error={errors.asunto?.message} {...register("asunto")} />
                  <Select id="a-modalidad" label={agenda.fields.modalidad} options={env.modalidadesAgenda.map((m) => ({ value: m, label: m }))} error={errors.modalidad?.message} {...register("modalidad")} />
                  <Input id="a-urgente" label={agenda.fields.urgente} type="date" optional error={errors.urgente?.message} {...register("urgente")} />
                  <Input id="a-fecha" label={agenda.fields.fecha} type="date" min={today} error={errors.fecha?.message} {...register("fecha")} />
                  <Input id="a-hora" label={agenda.fields.hora} type="time" step={1800} error={errors.hora?.message} {...register("hora")} />
                </div>

                {/* Duración, precio y política: solo si VERITUM los ha confirmado en variables de entorno. */}
                {(env.duracionAsesoria || env.precioAsesoria || agenda.policy) && (
                  <dl className="grid gap-4 rounded-brand border border-gris bg-marfil p-5 sm:grid-cols-2">
                    {env.duracionAsesoria && (
                      <div>
                        <dt className="eyebrow">{agenda.fields.duracion}</dt>
                        <dd className="mt-1 text-carbon/90">{env.duracionAsesoria}</dd>
                      </div>
                    )}
                    {env.precioAsesoria && (
                      <div>
                        <dt className="eyebrow">{agenda.fields.precio}</dt>
                        <dd className="mt-1 text-carbon/90">{env.precioAsesoria}</dd>
                      </div>
                    )}
                    {agenda.policy && (
                      <div className="sm:col-span-2">
                        <dt className="eyebrow">{agenda.policyTitle}</dt>
                        <dd className="mt-1 text-sm text-carbon/85">{agenda.policy}</dd>
                      </div>
                    )}
                  </dl>
                )}

                <Checkbox
                  id="a-terminos"
                  error={errors.terminos?.message}
                  label={
                    <>
                      {agenda.fields.terminos}{" "}
                      <Link href="/terminos-de-uso" className="link-text !underline" target="_blank">
                        {agenda.fields.terminosLink}
                      </Link>{" "}
                      {agenda.fields.y}{" "}
                      <Link href="/aviso-de-privacidad" className="link-text !underline" target="_blank">
                        {cf.fields.privacidadLink}
                      </Link>
                      .
                    </>
                  }
                  {...register("terminos")}
                />

                <AnimatePresence>
                  {status === "error" && serverError && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="flex gap-3 rounded-brand border border-[#b23b3b]/40 bg-[#fbf2f2] p-4 text-sm text-[#6d2323]">
                      <AlertTriangle className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
                      <div>
                        <p className="font-medium">{cf.errorTitle}</p>
                        <p className="mt-1">{serverError}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button type="submit" size="lg" arrow disabled={status === "sending"}>
                    {status === "sending" ? cf.sending : agenda.submit}
                  </Button>
                  <p className="text-sm text-carbon/65">{cf.afterSubmit}</p>
                </div>
              </form>
            ),
          )}

        {step === 2 &&
          panel(
            "confirmacion",
            <div role="status">
              <CheckCircle2 className="size-8 text-azul" strokeWidth={1.5} aria-hidden />
              <h2 className="font-display mt-4 type-h2 text-azul">{agenda.successTitle}</h2>
              <p className="measure mt-3 text-carbon/85">{agenda.successText(env.plazoRespuesta)}</p>
              <div className="mt-8 flex items-center gap-3 text-sm text-carbon/65">
                <CalendarCheck className="size-5 text-dorado-2" strokeWidth={1.5} aria-hidden />
                <Link href="/proceso" className="link-text !underline">
                  Conoce qué ocurre después del primer contacto
                </Link>
              </div>
            </div>,
          )}
      </AnimatePresence>
    </div>
  );
};
