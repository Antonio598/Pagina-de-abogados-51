"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Base = {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
};

const control =
  "w-full rounded-brand border bg-blanco px-4 py-3 text-base text-carbon placeholder:text-carbon/40 transition-[border-color,box-shadow] duration-200 focus:border-azul focus:outline-none focus-visible:outline-2 focus-visible:outline-dorado";

const Wrapper = ({ id, label, hint, error, optional, className, children }: Base & { id: string; children: ReactNode }) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label htmlFor={id} className="text-[0.95rem] font-medium text-azul">
      {label}
      {optional && <span className="ml-2 text-xs font-normal uppercase tracking-wider text-carbon/50">Opcional</span>}
    </label>
    {children}
    {hint && !error && (
      <p id={`${id}-hint`} className="text-sm text-carbon/60">
        {hint}
      </p>
    )}
    {error && (
      <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-sm text-[#8a2f2f]">
        <AlertCircle className="size-4" strokeWidth={1.75} aria-hidden />
        {error}
      </p>
    )}
  </div>
);

const aria = (id: string, error?: string, hint?: string) => ({
  "aria-invalid": error ? true : undefined,
  "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
});

type InputProps = Base & ComponentPropsWithoutRef<"input"> & { id: string };
export const Input = forwardRef<HTMLInputElement, InputProps>(({ id, label, hint, error, optional, className, ...rest }, ref) => (
  <Wrapper id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
    <input ref={ref} id={id} className={cn(control, error ? "border-[#b23b3b]" : "border-gris")} {...aria(id, error, hint)} {...rest} />
  </Wrapper>
));
Input.displayName = "Input";

type TextareaProps = Base & ComponentPropsWithoutRef<"textarea"> & { id: string; count?: { value: number; max: number } };
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ id, label, hint, error, optional, className, count, ...rest }, ref) => (
  <Wrapper id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
    <textarea ref={ref} id={id} rows={5} className={cn(control, "resize-y", error ? "border-[#b23b3b]" : "border-gris")} {...aria(id, error, hint)} {...rest} />
    {count && (
      <p className={cn("text-right text-xs tabular-nums", count.value > count.max ? "text-[#8a2f2f]" : "text-carbon/50")} aria-live="polite">
        {count.value.toLocaleString("es-MX")} / {count.max.toLocaleString("es-MX")}
      </p>
    )}
  </Wrapper>
));
Textarea.displayName = "Textarea";

type SelectProps = Base & ComponentPropsWithoutRef<"select"> & { id: string; options: readonly { value: string; label: string }[]; placeholder?: string };
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ id, label, hint, error, optional, className, options, placeholder, ...rest }, ref) => (
  <Wrapper id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
    <select ref={ref} id={id} className={cn(control, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%230D224C%22 stroke-width=%221.75%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat pr-10", error ? "border-[#b23b3b]" : "border-gris")} {...aria(id, error, hint)} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </Wrapper>
));
Select.displayName = "Select";

type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type"> & { id: string; label: ReactNode; error?: string };
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ id, label, error, className, ...rest }, ref) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label htmlFor={id} className="flex items-start gap-3 text-[0.95rem] text-carbon">
      <input ref={ref} id={id} type="checkbox" className="mt-1 size-4 shrink-0 accent-azul" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...rest} />
      <span>{label}</span>
    </label>
    {error && (
      <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-sm text-[#8a2f2f]">
        <AlertCircle className="size-4" strokeWidth={1.75} aria-hidden />
        {error}
      </p>
    )}
  </div>
));
Checkbox.displayName = "Checkbox";

/** Grupo de opciones tipo "chip" (radio). */
export const RadioChips = ({
  name,
  label,
  options,
  value,
  onChange,
  error,
}: {
  name: string;
  label: string;
  options: readonly { value: string; label: string }[];
  value?: string;
  onChange: (v: string) => void;
  error?: string;
}) => (
  <fieldset className="flex flex-col gap-2">
    <legend className="mb-1.5 text-[0.95rem] font-medium text-azul">{label}</legend>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const id = `${name}-${o.value}`;
        const selected = value === o.value;
        return (
          <div key={o.value}>
            <input type="radio" id={id} name={name} value={o.value} checked={selected} onChange={() => onChange(o.value)} className="peer sr-only" />
            <label
              htmlFor={id}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 text-sm transition-[background-color,color,border-color] duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-dorado peer-focus-visible:outline-offset-2",
                selected ? "border-azul bg-azul text-blanco" : "border-gris bg-blanco text-azul hover:border-azul/40",
              )}
            >
              {o.label}
            </label>
          </div>
        );
      })}
    </div>
    {error && (
      <p role="alert" className="flex items-center gap-1.5 text-sm text-[#8a2f2f]">
        <AlertCircle className="size-4" strokeWidth={1.75} aria-hidden />
        {error}
      </p>
    )}
  </fieldset>
);
