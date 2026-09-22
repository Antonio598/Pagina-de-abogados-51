"use client";

import { Clock, Mail, MapPin, MessageCircle, Phone, Video } from "lucide-react";
import { contact } from "@content/contact";
import { env, mailHref, telHref, whatsappHref } from "@/lib/env";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Props = { inverse?: boolean; className?: string; section: string };

/** Datos de contacto: solo se muestran los definidos en variables de entorno. */
export const ContactLinks = ({ inverse, className, section }: Props) => {
  const text = inverse ? "text-marfil/85" : "text-carbon";
  const label = inverse ? "text-marfil/55" : "text-carbon/55";
  const icon = cn("mt-1 size-[18px] shrink-0", inverse ? "text-dorado" : "text-dorado-2");
  const link = cn("underline-offset-4 hover:underline", inverse ? "hover:text-blanco" : "hover:text-azul");

  const rows: { key: string; icon: React.ReactNode; label: string; value: React.ReactNode }[] = [];

  if (env.telefono && telHref) {
    rows.push({
      key: "tel",
      icon: <Phone className={icon} strokeWidth={1.5} aria-hidden />,
      label: contact.labels.telefono,
      value: (
        <a href={telHref} className={link} onClick={() => track("telefono_click", { section })}>
          {env.telefono}
        </a>
      ),
    });
  }
  if (env.whatsapp && whatsappHref) {
    rows.push({
      key: "wa",
      icon: <MessageCircle className={icon} strokeWidth={1.5} aria-hidden />,
      label: contact.labels.whatsapp,
      value: (
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={link} onClick={() => track("whatsapp_click", { section })}>
          {env.whatsapp}
        </a>
      ),
    });
  }
  if (env.correo && mailHref) {
    rows.push({
      key: "mail",
      icon: <Mail className={icon} strokeWidth={1.5} aria-hidden />,
      label: contact.labels.correo,
      value: (
        <a href={mailHref} className={link} onClick={() => track("correo_click", { section })}>
          {env.correo}
        </a>
      ),
    });
  }
  if (env.domicilio) {
    rows.push({ key: "dom", icon: <MapPin className={icon} strokeWidth={1.5} aria-hidden />, label: contact.labels.domicilio, value: env.domicilio });
  }
  if (env.horario) {
    rows.push({ key: "hor", icon: <Clock className={icon} strokeWidth={1.5} aria-hidden />, label: contact.labels.horario, value: env.horario });
  }
  if (env.modalidad) {
    rows.push({ key: "mod", icon: <Video className={icon} strokeWidth={1.5} aria-hidden />, label: contact.labels.modalidad, value: env.modalidad });
  }

  if (rows.length === 0) return null;

  return (
    <ul className={cn("space-y-4", className)}>
      {rows.map((r) => (
        <li key={r.key} className="flex gap-3">
          {r.icon}
          <div className={cn("text-[0.95rem]", text)}>
            <p className={cn("text-xs uppercase tracking-widest", label)}>{r.label}</p>
            <p className="mt-0.5">{r.value}</p>
          </div>
        </li>
      ))}
    </ul>
  );
};
