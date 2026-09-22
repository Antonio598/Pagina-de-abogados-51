import { NextResponse, type NextRequest } from "next/server";
import { bloqueado, createSession, limpiarIntentos, panelConfigurado, registrarFallo, verifyPassword } from "@/lib/panel-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "0.0.0.0";

  if (!panelConfigurado()) {
    console.error("[panel] Falta PANEL_USER, PANEL_PASSWORD_HASH o PANEL_SESSION_SECRET.");
    return NextResponse.json({ ok: false, error: "El panel no está configurado." }, { status: 503 });
  }
  if (bloqueado(ip)) {
    return NextResponse.json({ ok: false, error: "Demasiados intentos. Espera 15 minutos." }, { status: 429 });
  }

  let body: { usuario?: string; password?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  const usuario = (body.usuario ?? "").trim();
  const password = body.password ?? "";
  const ok = usuario === process.env.PANEL_USER && (await verifyPassword(password, process.env.PANEL_PASSWORD_HASH!));

  if (!ok) {
    registrarFallo(ip);
    // Mensaje genérico: no revela si el usuario existe.
    return NextResponse.json({ ok: false, error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  limpiarIntentos(ip);
  await createSession(usuario);
  return NextResponse.json({ ok: true });
}
