import { NextResponse, type NextRequest } from "next/server";
import { PANEL_COOKIE } from "@/lib/panel-auth-shared";
import { PORTAL_COOKIE } from "@/lib/portal-auth-shared";
import { PROMO_COOKIE, promoMinutes, readPromo, signPromo } from "@/lib/promo";

// Convención de Next.js 16 (antes `middleware.ts`). Dos trabajos ligeros:
//
//  1. Landing: arrancar el reloj del precio de lanzamiento en la primera visita.
//     La hora de inicio va firmada en una cookie httpOnly, así que el visitante
//     no puede alargar la ventana desde el navegador.
//  2. Panel y portal: mandar a la pantalla de acceso a quien no traiga cookie de
//     sesión. La verificación real de la firma se hace en el layout del panel y
//     en la propia página del portal, que son la barrera de verdad; aquí solo se
//     comprueba que la cookie exista, para no meter criptografía en el camino de
//     cada petición.

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

  // El portal del cliente: `/portal` es la pantalla de acceso, el resto exige sesión.
  if (pathname.startsWith("/portal/")) {
    if (!request.cookies.get(PORTAL_COOKIE)?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      url.search = "";
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
      // Se guarda mucho más tiempo del que dura la oferta para que, al volver,
      // el visitante vea el precio normal y no una ventana reiniciada.
      maxAge: 60 * 60 * 24 * 30,
    });
    response.headers.set("x-veritum-promo-min", String(promoMinutes));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/consulta/:path*", "/panel/:path*", "/portal/:path*"],
};
