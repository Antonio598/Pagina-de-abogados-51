"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { asuntoOptions, canalOptions, contactForm as cf } from "@content/contact";
import { getResource } from "@content/library";
import { env } from "@/lib/env";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, RadioChips, Select, Textarea } from "./Field";

type Props = { defaultAsunto?: string; recurso?: string };

const canalLabel = (v: string) => canalOptions.find((c) => c.value === v)?.label.toLowerCase() ?? v;

export const ContactForm = ({ defaultAsunto, recurso }: Props) => {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const resource = recurso ? getResource(recurso) : undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      asunto: (asuntoOptions.some((o) => o.value === defaultAsunto) ? defaultAsunto : undefined) as ContactInput["asunto"],
      recurso: recurso ?? "",
      empresa_web: "",
      municipio: "",
    },
    mode: "onBlur",
  });

  const descripcion = watch("descripcion") ?? "";
  const canal = watch("canal");

  const onSubmit = async (values: ContactInput) => {
    setStatus("sending");
    setServerError(null);
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, tipo: "contacto" }),
      });
      const json = (await res.json()) as { ok: boolean; id?: string; error?: string; fields?: Record<string, string> };
      if (!res.ok || !json.ok) {
        if (json.fields) {
          for (const [k, msg] of Object.entries(json.fields)) setError(k as keyof ContactInput, { message: msg });
        }
        setServerError(json.error ?? cf.errorText);
        setStatus("error");
        track("formulario_enviado", { section: "contact", result: "error" });
        return;
      }
      // Deduplicación: un doble clic no genera dos conversiones para el mismo folio.
      track("formulario_enviado", { section: "contact", result: "completado", element_id: "contact_form" }, { once: `contact:${json.id ?? "sent"}` });
      setStatus("success");
    } catch {
      setServerError(cf.errorText);
      setStatus("error");
      track("formulario_enviado", { section: "contact", result: "error" });
    }
  };

  if (status === "success") {
    return (
      <div role="status" className="anim-rise rounded-brand border border-dorado/40 bg-blanco p-6 shadow-card md:p-8">
        <CheckCircle2 className="size-8 text-azul" strokeWidth={1.5} aria-hidden />
        <h2 className="font-display mt-4 type-h2 text-azul">{cf.successTitle}</h2>
        <p className="measure mt-3 text-carbon/85">{cf.successText(env.plazoRespuesta, canalLabel(canal))}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-6" aria-describedby="form-after">
      {resource && (
        <p className="rounded-brand border border-gris bg-marfil px-4 py-3 text-sm text-carbon/80">{cf.resourceNote(resource.title)}</p>
      )}

      {/* Honeypot: oculto para personas, visible para bots. */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label htmlFor="empresa_web">No completar este campo</label>
        <input id="empresa_web" type="text" tabIndex={-1} autoComplete="off" {...register("empresa_web")} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Input id="nombre" label={cf.fields.nombre} autoComplete="name" error={errors.nombre?.message} {...register("nombre")} />
        <Input id="correo" label={cf.fields.correo} type="email" autoComplete="email" inputMode="email" error={errors.correo?.message} {...register("correo")} />
        <Input id="telefono" label={cf.fields.telefono} type="tel" autoComplete="tel" inputMode="tel" placeholder="+52 55 0000 0000" hint={cf.fields.telefonoHint} error={errors.telefono?.message} {...register("telefono")} />
        <Select id="asunto" label={cf.fields.asunto} options={asuntoOptions} placeholder="Selecciona una opción" error={errors.asunto?.message} {...register("asunto")} />
        <Input id="entidad" label={cf.fields.entidad} autoComplete="address-level1" placeholder="Ciudad de México / Estado de México" error={errors.entidad?.message} {...register("entidad")} />
        <Input id="municipio" label={cf.fields.municipio} autoComplete="address-level2" optional error={errors.municipio?.message} {...register("municipio")} />
      </div>

      <Textarea
        id="descripcion"
        label={cf.fields.descripcion}
        maxLength={cf.maxChars}
        count={{ value: descripcion.length, max: cf.maxChars }}
        error={errors.descripcion?.message}
        {...register("descripcion")}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Input id="fecha" label={cf.fields.fecha} type="date" optional hint={cf.fields.fechaHint} error={errors.fecha?.message} {...register("fecha")} />
        <RadioChips name="canal" label={cf.fields.canal} options={canalOptions} value={canal} onChange={(v) => setValue("canal", v as ContactInput["canal"], { shouldValidate: true })} error={errors.canal?.message} />
      </div>

      <Checkbox
        id="privacidad"
        error={errors.privacidad?.message}
        label={
          <>
            {cf.fields.privacidad}{" "}
            <Link href="/aviso-de-privacidad" className="link-text !underline" target="_blank">
              {cf.fields.privacidadLink}
            </Link>
            .
          </>
        }
        {...register("privacidad")}
      />

        {status === "error" && serverError && (
          <div role="alert" className="anim-rise flex gap-3 rounded-brand border border-[#b23b3b]/40 bg-[#fbf2f2] p-4 text-sm text-[#6d2323] [animation-duration:250ms]">
            <AlertTriangle className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
            <div>
              <p className="font-medium">{cf.errorTitle}</p>
              <p className="mt-1">{serverError}</p>
            </div>
          </div>
        )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" arrow disabled={status === "sending"}>
          {status === "sending" ? cf.sending : cf.submit}
        </Button>
        <p id="form-after" className="text-sm text-carbon/75">
          {cf.afterSubmit}
        </p>
      </div>
    </form>
  );
};
