"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/forms/Field";

export const LoginForm = ({ desde }: { desde?: string }) => {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("/api/panel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "No pudimos iniciar sesión.");
        setEnviando(false);
        return;
      }
      router.replace(desde && desde.startsWith("/panel") ? desde : "/panel/citas");
      router.refresh();
    } catch {
      setError("No pudimos iniciar sesión. Revisa tu conexión.");
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Input id="usuario" label="Usuario" autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
      <Input id="password" label="Contraseña" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />

      {error && (
        <p role="alert" className="flex gap-2 rounded-brand border border-[#b23b3b]/40 bg-[#fbf2f2] p-3 text-sm text-[#6d2323]">
          <AlertTriangle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={enviando}>
        <Lock className="size-4" aria-hidden />
        {enviando ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
};
