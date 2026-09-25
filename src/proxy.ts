import { NextResponse, type NextRequest } from "next/server";
import { PANEL_COOKIE } from "@/lib/panel-auth-shared";
import { PORTAL_COOKIE } from "@/lib/portal-auth-shared";

// Convención de Next.js 16 (antes `middleware.ts`).
//
// Un solo trabajo, deliberadamente ligero: mandar a la pantalla de acceso a
// quien no traiga cookie de sesión. La verificación real de la firma se hace en
// el layout del panel y en la propia página del portal, que son la barrera de
// verdad; aquí solo se comprueba que la cookie exista, para no meter
// criptografía en el camino de cada petición.
//
// La landing ya no pasa por aquí: arrancaba el reloj de la promoción, que se
// retiró junto con el descuento por tiempo limitado.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const aAcceso = (destino: string) => {
    const url = request.nextUrl.clone();
    url.pathname = destino;
    url.search = `?desde=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  };

  if (pathname.startsWith("/panel") && pathname !== "/panel/acceso") {
    if (!request.cookies.get(PANEL_COOKIE)?.value) return aAcceso("/panel/acceso");
  }

  // El portal del cliente: `/portal` es la pantalla de acceso, todo lo demás
  // exige sesión.
  if (pathname.startsWith("/portal/")) {
    if (!request.cookies.get(PORTAL_COOKIE)?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/portal/:path*"],
};
