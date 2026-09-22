import { NextResponse, type NextRequest } from "next/server";
import { PROMO_COOKIE, promoMinutes, readPromo, signPromo } from "@/lib/promo";
import { PANEL_COOKIE } from "@/lib/panel-auth-shared";

// Convención de Next.js 16 (antes `middleware.ts`).
// Dos trabajos, ambos ligeros:
//  1. Landing: arrancar el reloj de la promoción en la primera visita.
//  2. Panel: redirigir a la pantalla de acceso si no hay cookie de sesión.
//     La verificación real de la firma se hace en el layout del panel.

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/panel") && pathname !== "/panel/acceso") {
    if (!request.cookies.get(PANEL_COOKIE)?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/panel/acceso";
      url.search = `?desde=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === "/consulta" || pathname.startsWith("/consulta/")) {
    const existente = await readPromo(request.cookies.get(PROMO_COOKIE)?.value);
    if (existente !== null) return NextResponse.next();

    const response = NextResponse.next();
    response.cookies.set(PROMO_COOKIE, await signPromo(Date.now()), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      // Se guarda más tiempo del que dura la promoción para que, al volver,
      // el visitante vea el precio normal y no un descuento reiniciado.
      maxAge: 60 * 60 * 24 * 30,
    });
    response.headers.set("x-veritum-promo-min", String(promoMinutes));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/consulta/:path*", "/panel/:path*"],
};
