import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = "md" | "lg" | "sm";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-brand text-center font-medium transition-[background-color,color,border-color,box-shadow] duration-200 ease-brand disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-azul text-blanco hover:bg-azul-2 shadow-[0_1px_0_rgb(255_255_255/0.08)_inset]",
  secondary: "border border-azul text-azul bg-transparent hover:bg-azul/5",
  ghost: "text-azul hover:bg-azul/5",
  inverse: "bg-blanco text-azul hover:bg-marfil",
};

const sizes: Record<Size, string> = {
  // min-h en lugar de h: un texto largo puede partirse en dos líneas en pantallas estrechas.
  sm: "min-h-10 px-4 py-1.5 text-[0.9375rem] leading-tight",
  md: "min-h-12 px-6 py-2 text-base leading-tight",
  lg: "min-h-14 px-6 py-2.5 text-[1.0625rem] leading-tight sm:px-8",
};

type Common = {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

const Arrow = () => (
  <ArrowRight
    aria-hidden
    className="size-[18px] transition-transform duration-200 ease-brand group-hover:translate-x-0.5"
    strokeWidth={1.75}
  />
);

type ButtonLinkProps = Common & { href: string; ref?: React.Ref<HTMLAnchorElement> } & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "href" | "className" | "children"
  >;
type ButtonProps = Common & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export const ButtonLink = ({ href, variant = "primary", size = "md", arrow, className, children, ref, ...rest }: ButtonLinkProps) => (
  <Link ref={ref} href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
    {children}
    {arrow && <Arrow />}
  </Link>
);

export const Button = ({ variant = "primary", size = "md", arrow, className, children, type = "button", ...rest }: ButtonProps) => (
  <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
    {children}
    {arrow && <Arrow />}
  </button>
);
