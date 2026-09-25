# VERITUM — sitio web

Sitio institucional de **VERITUM · Capital Humano & Legal**. Next.js 16 (App Router) + TypeScript + Tailwind v4, animaciones con CSS + `IntersectionObserver` (sin librerías de movimiento), empaquetado como imagen Docker `standalone` para **EasyPanel**.

Tagline (elemento tipográfico independiente, nunca parte del logotipo): _Estrategia legal con claridad y acompañamiento humano._

---

## 1. Arranque local

```bash
npm install
cp .env.example .env      # rellena solo lo confirmado por VERITUM
npm run dev               # http://localhost:3000
npm run build && npm run lint
```

Producción local equivalente al contenedor:

```bash
npm run build
node .next/standalone/server.js   # tras copiar public/ y .next/static (ver Dockerfile)
```

## 2. Despliegue en EasyPanel

1. **Crear servicio → App** desde el repositorio Git (o subir el código). Tipo de build: **Dockerfile** (ya incluido en la raíz).
2. **Environment**: pega el contenido de `.env.example` con los valores reales. Las variables `NEXT_PUBLIC_*` se fijan **en el build**: añádelas también en *Build arguments* o reconstruye la imagen cada vez que cambien.
3. **Puerto**: 3000 (`PORT`/`HOSTNAME` ya vienen en la imagen).
4. **Dominio**: `veritum.com.mx` con HTTPS (Let's Encrypt desde EasyPanel). Fuerza la redirección a HTTPS en el proxy de EasyPanel.
5. Deploy. Revisa `/`, `/servicios`, `/contacto`, `/agenda`, `/sitemap.xml` y `/robots.txt`.

Correo: el formulario usa SMTP (`SMTP_*` + `CONTACT_TO_EMAIL`). Sin SMTP configurado, la API responde **503** con un mensaje claro y no simula envíos.

## 3. Editar contenido sin tocar componentes

Todo el texto vive en `content/`:

| Archivo | Qué contiene |
| --- | --- |
| `content/site.ts` | Marca, tagline, pilares, Método, menú, pie, leyenda obligatoria |
| `content/home.ts` | Inicio (todos los bloques en el orden aprobado) |
| `content/services.ts` | 4 servicios: título, intro, asuntos, aviso de alcance, FAQ relacionadas |
| `content/about.ts` | Quiénes somos: párrafos, manera de trabajar, misión, visión, valores |
| `content/process.ts` | Proceso (6 pasos, qué preparar, nota) y Estrategia preventiva |
| `content/library.ts` | Biblioteca: categorías, recursos, CTA, cuerpo de artículos |
| `content/faqs.ts` | Preguntas frecuentes generales |
| `content/contact.ts` | Contacto, formulario, agenda (aviso previo literal) |
| `content/legal.ts` | Estructura de avisos legales (el texto lo entrega VERITUM) |
| `content/seo.ts` | Title y meta descripción por página (Bloque 7) |

Los textos son **literales y aprobados**. Cualquier cambio requiere autorización de VERITUM. Los datos de contacto, precios, proveedor de agenda y GTM se gestionan **solo** por variables de entorno: si están vacías, el bloque no se muestra.

> Migración a CMS: la capa `content/` está pensada para sustituirse por un CMS headless (Payload, Sanity, Strapi…) sin cambiar los componentes; cada archivo corresponde a un tipo de contenido.

## 4. Pendientes bloqueantes antes del lanzamiento

- [x] ~~Logotipo oficial~~ — integrado desde `public/brand/veritum-logo-master.png`. Los tamaños y los íconos se regeneran con `node scripts/generate-brand-assets.mjs`. Pendiente menor: pedir a VERITUM el **archivo vectorial (SVG/AI)** y la **versión simplificada oficial** para el favicon; hoy el emblema se aísla del propio PNG oficial.
- [ ] **Avisos legales** — `content/legal.ts` solo tiene la estructura; las páginas muestran una nota de publicación pendiente. Cargar el texto entregado por VERITUM en `body`.
- [ ] **Datos de contacto, horario, modalidad, redes** — variables `NEXT_PUBLIC_*`.
- [ ] **Precio, duración y política de cancelación** de la asesoría — variables; hasta entonces no se muestran.
- [ ] **Proveedor de agenda y pagos** (`NEXT_PUBLIC_AGENDA_URL`) con cuentas a nombre de VERITUM. Sin proveedor, la reserva se solicita por formulario y se confirma por correo.
- [ ] **PDFs de Biblioteca** — `downloadUrl` en `content/library.ts`; mientras tanto "Descargar" canaliza a Contacto con el recurso identificado (sin enlaces rotos).
- [ ] **Cuerpo de los artículos** de Biblioteca (`body` en `content/library.ts`).
- [ ] **Fotografía** real y editorial (hoy el sitio usa composición tipográfica y retícula; no hay fotos de banco).
- [ ] **Equipo profesional** — sección omitida hasta contar con datos confirmados (`src/app/quienes-somos/page.tsx`).
- [ ] **GTM / GA4 / Meta Pixel / Search Console** con cuentas de VERITUM (`NEXT_PUBLIC_GTM_ID`).
- [ ] Revisar y aprobar la **microcopia de formularios** (etiquetas, errores, mensajes de éxito) en `content/contact.ts`.
- [ ] `PRIVACY_NOTICE_VERSION` y política de retención de datos de formularios.
- [ ] Prueba con cinco usuarios (Bloque 8) y revisión final de contraste, teclado y Lighthouse móvil.

## 5. Medición

`src/lib/analytics.ts` empuja eventos a `window.dataLayer` (GTM los enruta a GA4 y Meta): `page_view`, `servicio_visto`, `cta_agenda`, `agenda_iniciada`, `agenda_confirmada`, `formulario_enviado`, `whatsapp_click`, `telefono_click`, `correo_click`, `guia_descargada`, `scroll_relevante`. Cada evento incluye página/sección/servicio, dispositivo, resolución y UTM (persistidos en `sessionStorage`). **Nunca** se envían nombres, correos, teléfonos ni descripciones. GTM solo se carga tras el consentimiento del banner (`src/components/layout/Analytics.tsx`); las etiquetas publicitarias deben condicionarse en GTM al evento `consent_update`.

## 6. Estructura

```
content/                 textos aprobados (ver tabla)
src/app/                 rutas (App Router), API de formularios, sitemap, robots, OG
src/components/layout/   Header, Footer, Logo (provisional), Analytics/consentimiento
src/components/home/     bloques de Inicio en el orden aprobado
src/components/services/ MethodBand, ProcessSteps, tracker de servicio
src/components/library/  índice con filtros y cabecera de artículo
src/components/forms/    ContactForm, BookingForm (reserva + pago), AgendaFlow, campos
src/components/landing/  bloques de /consulta (contador, video, confirmación)
src/components/panel/    acceso, detalle de cita y navegación del panel
supabase/schema.sql      esquema de la base de datos (pegar en Supabase)
src/components/motion/   Reveal, Stagger, DrawLine, useScrollProgress (CSS + IntersectionObserver; respetan prefers-reduced-motion)
src/lib/                 env, analytics, tracking propio, booking, pricing, promo,
                         stripe, db (Supabase), panel-auth, schema (JSON-LD), validación
```

## 6.1 Logotipo

El archivo maestro es `public/brand/veritum-logo-master.png`, tal como lo entregó VERITUM. De él se derivan, con `node scripts/generate-brand-assets.mjs`:

| Archivo | Para qué |
| --- | --- |
| `public/brand/veritum-logo-440.png` y `-880.png` | Logotipo horizontal del encabezado, el pie y la landing |
| `public/icon.png`, `icon-192.png`, `apple-icon.png` | Favicon e íconos de móvil (emblema sobre fondo marfil) |
| `public/brand/veritum-emblema.png` | Emblema aislado con fondo transparente |

El logotipo nunca se redibuja, recolorea ni deforma, y el tagline sigue siendo un elemento tipográfico aparte. Sobre fondo azul se coloca dentro de una superficie marfil (`<Logo inverse />`), porque no existe una versión invertida oficial. Si VERITUM entrega un archivo nuevo, se reemplaza el maestro y se vuelve a ejecutar el script.

## 7. Accesibilidad y rendimiento

Lighthouse móvil (simulación 4G lenta, CPU ×4): rendimiento 86–97, accesibilidad 100, buenas prácticas 100, SEO 100. Sin desbordes horizontales desde 360 px; objetivos de toque ≥ 40 px en navegación, filtros y formularios.

Navegación completa por teclado (menú móvil con trampa de foco y Esc), foco visible con anillo dorado, contraste AA (el dorado nunca se usa en texto de cuerpo), un H1 por página, etiquetas asociadas a cada campo, errores junto al campo, `prefers-reduced-motion` respetado, sin parallax, sin video, sin carruseles, sin pop-ups. Fuentes: Inter + Fraunces vía `next/font` (dos familias máximo).

---

## 8. Reservas con pago, landing de campaña y panel interno

### 8.1 Qué es cada cosa

| Ruta | Qué es | Visible al público |
| --- | --- | --- |
| `/consulta` | Landing para anuncios de Meta, pensada para móvil | No: `noindex`, fuera del sitemap y sin enlaces desde el sitio |
| `/consulta/agendar` | Formulario de reserva de la landing (página aparte) | No |
| `/consulta/confirmacion` | Regreso desde Stripe; confirma cuando el pago se registra | No |
| `/agenda` | Reserva desde el sitio público (mismo motor, otro diseño) | Sí, pero `noindex` |
| `/panel` | Panel interno: citas, horarios y métricas | No: `noindex` y `Disallow` en robots.txt |

**El pago es lo que confirma la cita.** Al enviar el formulario, el horario se aparta 20 minutos (`BOOKING_HOLD_MINUTES`) mientras la persona paga. Si no paga, se libera solo. Cuando Stripe avisa que el pago se completó, la cita pasa a `pagada`, se envían los correos y aparece en el panel.

### 8.2 Puesta en marcha

**1) Base de datos**
1. Abre tu PostgreSQL o Supabase (puede ser el mismo que ya uses para otra app) y entra al *SQL Editor* o conéctate con `psql`.
2. Ejecuta [supabase/schema.sql](supabase/schema.sql) completo. Crea el esquema **`veritum`**, separado de `public`, así que no toca nada de tus otras aplicaciones. Es idempotente: puedes volver a ejecutarlo.
3. Pon la cadena de conexión en `DATABASE_URL`.

La aplicación se conecta **directo a Postgres**, no por la API REST de Supabase. Eso le da transacciones reales (necesarias para apartar un horario sin duplicados) y evita depender de la configuración de esquemas expuestos y del certificado del dominio.

> **Cifrado.** Si la base de datos vive en el mismo servidor de EasyPanel, usa el **nombre interno del servicio** en `DATABASE_URL` (por ejemplo `proyecto_supabase-db:5432`): el tráfico no sale a internet. Si va por internet, usa `sslmode=require`; con `sslmode=disable` los nombres, teléfonos y descripciones de los casos viajan sin cifrar.

**2) Stripe**
1. Crea el producto "Asesoría legal inicial" con dos precios: normal y promocional.
2. Copia `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` y `STRIPE_PRICE_PROMO_ID`.
3. Crea el webhook apuntando a `https://<tu-dominio>/api/stripe/webhook` con los eventos `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded` y `checkout.session.async_payment_failed`. Copia `STRIPE_WEBHOOK_SECRET`.
4. Escribe los mismos importes **en centavos** en `NEXT_PUBLIC_PRECIO_NORMAL` y `NEXT_PUBLIC_PRECIO_PROMO` (son los que se muestran en pantalla).

Pruebas locales del cobro:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook   # copia el whsec_ que imprime
# tarjeta de prueba 4242 4242 4242 4242, cualquier fecha futura y CVC
```

**3) Panel interno**
```bash
node scripts/hash-password.mjs "una contraseña larga"   # imprime PANEL_PASSWORD_HASH
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # PANEL_SESSION_SECRET
```
Define además `PANEL_USER`. La sesión dura 8 horas y se bloquea el acceso 15 minutos tras 5 intentos fallidos.

**4) Video y agente de IA de la landing**
- Sube el MP4 a `public/video/` y pon la ruta en `NEXT_PUBLIC_LANDING_VIDEO` (por ejemplo `/video/veritum.mp4`). Añade una miniatura en `NEXT_PUBLIC_LANDING_VIDEO_POSTER`. Se reproduce solo al tocar: nada de autoplay. Mantenlo por debajo de ~10 MB.
- Cuando exista el agente, pon su enlace en `NEXT_PUBLIC_AGENTE_IA_URL`. Sin esa variable, el botón no aparece en ningún lado.

**5) Horarios**
Entra a `/panel/disponibilidad` y define las franjas por día de la semana. El esquema trae lunes a viernes de 10:00 a 14:00 y de 16:00 a 18:00 como ejemplo. Cada franja se divide en sesiones de `BOOKING_SLOT_MINUTES` (45 por omisión).

### 8.2 bis Servicio 100 % en línea

Todas las asesorías son por **videollamada**, en **todo México**. No hay modalidad presencial: el formulario ya no la pregunta y el servidor la fija (`site.modalidad`). El correo de confirmación incluye el enlace de la sesión.

### 8.3 El descuento por tiempo limitado

Es un descuento **real**, no un adorno: el reloj (10 minutos, `NEXT_PUBLIC_PROMO_MINUTOS`) empieza en la primera visita a `/consulta`, se guarda firmado en una cookie httpOnly y, al expirar, Stripe cobra el precio normal. El precio se decide siempre en el servidor ([src/app/api/reservas/route.ts](src/app/api/reservas/route.ts)), así que modificarlo desde el navegador no tiene efecto. Para apagarlo por completo, deja vacío `NEXT_PUBLIC_PRECIO_PROMO`.

### 8.3 bis Escasez real y ventana de salida

El aviso "Quedan N horarios esta semana" sale de `getCupoSemana()` en [src/lib/booking.ts](src/lib/booking.ts): cuenta los huecos libres reales de los próximos 7 días. Si la agenda se llena, el bloque desaparece en lugar de inventar cupo.

La ventana al intentar salir ([ExitIntent.tsx](src/components/landing/ExitIntent.tsx)) aparece **una sola vez por sesión**, solo en `/consulta`, nunca en el formulario ni tras pagar, y se cierra con Esc, con clic fuera o con su botón.

### 8.4 Métricas del panel

`/panel/metricas` muestra visitantes del sitio y de la landing, tiempo promedio de permanencia, visitas por día, embudo de la landing (visitas → formulario → pago iniciado → pagadas), páginas más vistas y de dónde llegan. Los datos son de primera persona ([src/lib/tracking.ts](src/lib/tracking.ts)): sin IP, sin cookies de seguimiento y con un identificador de sesión anónimo que muere al cerrar la pestaña.

### 8.5 Pendientes de esta fase

- [ ] Aprobar los textos de la landing en [content/landing.ts](content/landing.ts) (son nuevos, no forman parte del documento aprobado).
- [ ] Subir el video MP4 y su miniatura.
- [ ] Definir precio normal y promocional, y crearlos en Stripe.
- [ ] Conectar el agente de IA.
- [ ] Añadir al aviso de privacidad las secciones de reservas, Stripe y medición propia (ya están listadas en [content/legal.ts](content/legal.ts)).
- [ ] Añadir al aviso de privacidad la transferencia de datos a n8n para el seguimiento automático (nombre y folio del cliente).
- [ ] Probar el pago de extremo a extremo en producción con una tarjeta real de bajo importe y reembolsarla.

### 8.6 Seguimiento automático con n8n

La documentación completa, con ejemplos de `curl` listos para pegar y el estado en
vivo de los contactos, está dentro del panel: **[/panel/api](http://localhost:3000/panel/api)**.
Lo que sigue es el resumen.

n8n avisa cada vez que habla con una persona; el sitio guarda esa hora y, si no
se actualiza, manda un recordatorio al webhook de n8n a **1 h**, **3 h** y **24 h**
de silencio. Cada recordatorio se manda **una sola vez por teléfono, de por vida**.

| Método | Ruta | Para qué |
| --- | --- | --- |
| POST | `/api/seguimientos/contacto` | Registrar la última hora de contacto de un teléfono |
| GET | `/api/seguimientos/contacto?telefono=…` | Consultar el estado de un teléfono |
| POST o GET | `/api/seguimientos/ejecutar` | Ejecutar el barrido de recordatorios |

Las tres exigen `Authorization: Bearer <SEGUIMIENTO_API_TOKEN>`.

**El sitio no tiene reloj propio.** No hay cron y el contenedor se reinicia en cada
despliegue, así que el vencimiento lo decide siempre la base de datos comparando
contra `now()`. Lo único que hace falta desde fuera es que alguien llame al
barrido: un flujo de n8n con nodo **Schedule cada 5 minutos** apuntando a
`/api/seguimientos/ejecutar`. Ese flujo **no es opcional**: sin él los
recordatorios solo salen cuando llega un contacto nuevo.

Reglas que conviene tener claras:

- **Quien ya agendó no recibe recordatorios.** Bloquea una cita pagada que todavía
  no ha ocurrido, y un pago en curso con la retención viva. No se consume nada:
  si la retención vence sin que pague, el seguimiento se reanuda solo —
  justamente el caso más valioso, alguien que estuvo a punto de pagar y se fue.
  Una cita que ya ocurrió no bloquea.
- Si la hora de contacto se actualiza, el reloj vuelve a cero y los recordatorios
  que aún no se hayan mandado se recalculan desde la hora nueva. Los ya enviados
  no se repiten nunca.
- Si un recordatorio vence estando el sistema sin barrer, se marca como
  `omitido`: ante 30 horas de silencio de golpe se manda el de 24 h y no los tres
  seguidos. Los omitidos tampoco se mandan después.
- Si el POST al webhook falla se reintenta 3 veces (a los 2 y a los 10 minutos).
  El hueco del contacto queda cerrado desde el primer intento, así que un fallo
  de red no puede provocar un envío doble.
- El recordatorio lleva el nombre y el folio del cliente cuando el teléfono
  coincide con una cita. El cruce usa los 10 últimos dígitos, así que funciona
  aunque el teléfono esté escrito en otro formato.
- Desde `/panel/api` se puede **reiniciar** manualmente los recordatorios de un
  teléfono. Es manual a propósito: nada automático reactiva a nadie.

Puesta en marcha:

1. Volver a ejecutar [supabase/schema.sql](supabase/schema.sql) completo en el SQL
   Editor de Supabase (es idempotente). Añade las tablas `contactos` y
   `recordatorios` y sus dos funciones.
2. En EasyPanel → Environment, definir `SEGUIMIENTO_API_TOKEN` y
   `SEGUIMIENTO_WEBHOOK_URL` (y `SEGUIMIENTO_WEBHOOK_SECRET`, recomendado).
   No son `NEXT_PUBLIC_*`: basta reiniciar, no hay que reconstruir la imagen.
3. En n8n: una credencial *Header Auth*, un nodo *HTTP Request* al final de cada
   rama que hable con la persona, y el flujo aparte con el nodo *Schedule*.
