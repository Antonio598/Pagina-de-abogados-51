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
1. Copia `STRIPE_SECRET_KEY`.
2. Crea el webhook apuntando a `https://<tu-dominio>/api/stripe/webhook` con los eventos `checkout.session.completed`, `checkout.session.expired`, `checkout.session.async_payment_succeeded` y `checkout.session.async_payment_failed`. Copia `STRIPE_WEBHOOK_SECRET`.
3. **No hace falta crear productos ni precios en Stripe**: el importe se manda en cada cobro desde [content/productos.ts](content/productos.ts), que es la fuente de verdad (ver 8.7). Si prefieres gestionarlos en Stripe, crea un precio por servicio y pon sus ids en `STRIPE_PRICE_ASESORIA_ID` y `STRIPE_PRICE_REVISION_ID`.

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

### 8.3 Escasez real de horarios

El bloque «Quedan N horarios esta semana» de la landing sale de la agenda de
verdad (`getCupoSemana()` en [src/lib/booking.ts](src/lib/booking.ts)): cuenta
los huecos libres de los próximos 7 días y se actualiza solo. No hay ningún
número inventado ni ninguna cuenta atrás; el descuento por tiempo limitado se
retiró (ver 8.7).

La ventana al intentar salir es de **ayuda, no de retención**: sin precio, sin
reloj y sin cupo. Solo ofrece el asistente y la sección de cómo trabajamos, para
quien prefiere preguntar antes de pagar.

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

### 8.7 Defensa laboral para patrones: dos servicios y el crédito

La landing de campaña (`/consulta`) está dedicada **exclusivamente a defensa
laboral para patrones**. No es una landing para trabajadores ni de servicios
generales: la comunicación se concentra en tres situaciones (citatorio de
conciliación, demanda o notificación, y terminación o negociación de salida).

**Los importes NO son variables de entorno.** Viven en
[content/productos.ts](content/productos.ts): `$1,990` la asesoría y `$3,490` la
revisión prioritaria. La razón es concreta: las `NEXT_PUBLIC_*` se congelan en el
build y el `Dockerfile` no declaraba `ARG NEXT_PUBLIC_PRECIO_NORMAL`, así que en
la imagen desplegada el precio quedaba vacío, la landing no mostraba importe,
`/consulta/agendar` no mostraba formulario y `/api/reservas` respondía 503 —
aunque la variable estuviera puesta en EasyPanel. Un literal en `content/` se ve
en el diff; una variable ausente no se nota hasta que un cliente no puede pagar.

| Servicio | Importe | Anticipación | Documentación |
| --- | --- | --- | --- |
| Asesoría laboral para patrones | $1,990 | 2 h | opcional |
| Revisión laboral prioritaria | $3,490 | **48 h** | necesaria, por el portal |

Las 48 horas del servicio prioritario no son un aviso, son el calendario: los
horarios más cercanos **no se ofrecen**, porque la revisión documental no puede
existir sin tiempo para revisar. `getAvailability` e `isSlotOffered` reciben la
anticipación del producto, y el servidor vuelve a comprobarla al reservar.

**El crédito de representación** es el argumento comercial central: si el cliente
contrata a VERITUM para el mismo asunto y el despacho acepta la representación, se
descuenta el 100 % de lo pagado por la asesoría. El modelo de datos es mínimo a
propósito: el importe pagado (`precio_centavos`) **ya es** el crédito, así que solo
se guarda lo que la base no puede deducir — `credito_vence_at` (se fija al pagar,
para que un cambio futuro de política no caduque créditos ya vendidos),
`credito_aplicado_at` y `credito_asunto`. Se marca como aplicado desde el detalle
de la cita en `/panel/citas`, y un `check` de la base impide marcarlo sin decir a
qué asunto.

El texto del crédito para pegar en el bot de n8n está en `/panel/api`, generado
desde el mismo `content/productos.ts`: cuando cambie un precio o una condición, el
texto del bot cambia en el mismo despliegue.

**Se retiró el reloj de 10 minutos** con su descuento por tiempo limitado y el
precio tachado: contradecía el requisito de no usar urgencia artificial. Se
borraron `src/lib/promo.ts`, `src/lib/promo-server.ts` y `PromoBar.tsx`. Las
columnas `promo_aplicada` y `precio_centavos` se conservan por las filas
históricas. El bloque «Quedan N horarios esta semana» **sí se mantiene**: ese dato
sale de la agenda real (`getCupoSemana()`), no es escasez inventada.

### 8.8 Portal del cliente

`/portal` — el cliente entra con su **teléfono y el folio** que recibió al pagar, y
carga la documentación de su asunto. Dos datos que él tiene y un extraño no: el
folio da 32⁶ ≈ 1.07 mil millones de combinaciones y además hay que acertar el
teléfono del titular. El acceso está limitado a 5 intentos por IP cada 15 minutos,
con un freno global de 60 fallos en 10 minutos.

Los tres fallos posibles (folio inexistente, teléfono equivocado, folio mal
formado) devuelven **el mismo mensaje** y tardan lo mismo, con un suelo de 300 ms:
si no, se podrían enumerar folios válidos.

**Los archivos se guardan en PostgreSQL** (`veritum.documentos`, columna `bytea`),
no en disco: el contenedor corre como usuario sin privilegios, no tiene
directorio escribible y no hay volumen montado, así que cualquier archivo en disco
desaparecería en el siguiente despliegue. La columna `contenido` nunca entra en un
`select *` — solo la lee la ruta de descarga, por id.

Límites y comprobaciones de la carga: 15 MB por archivo, 3 por envío, 20 por
cliente; lista blanca por extensión (PDF, JPG, PNG, WEBP, HEIC, DOCX, XLSX); el
tipo que declara el navegador **se ignora** y se comprueba la **firma real del
archivo**, que es lo que atrapa un HTML renombrado a `.pdf`. Todo se sirve con
`Content-Type: application/octet-stream`, `Content-Disposition: attachment` y
`nosniff`, para que nada pueda ejecutarse en el origen del sitio.

La carga usa un Route Handler y no una Server Action: las Server Actions están
topadas en 1 MB, y subir ese tope lo elevaría para todas las acciones de la
aplicación, incluidas las del panel. El formulario funciona **sin JavaScript**.

`/panel/archivos` muestra los documentos agrupados por cliente, con búsqueda por
teléfono, folio o nombre, y descarga autenticada por `/api/panel/documentos/[id]`.
Los documentos del cliente también aparecen en el detalle de su cita.

El cliente llega al portal por tres caminos: la página de confirmación del pago,
el correo de confirmación y un enlace en el pie de la landing.

### 8.10 Correo con Resend

El transporte de correo vive en [src/lib/mailer.ts](src/lib/mailer.ts) y prefiere
**Resend** sobre SMTP: es una API HTTPS, no hace falta servidor de correo ni
puertos abiertos, y admite una **clave de idempotencia** que Resend respeta 24 h.
Eso último importa aquí: si Stripe reintenta el evento de pago, el cliente no
recibe dos veces la confirmación.

| Variable | Para qué |
| --- | --- |
| `RESEND_API_KEY` | Clave de https://resend.com/api-keys |
| `RESEND_FROM` | Remitente. **Debe pertenecer a un dominio verificado en Resend** |
| `CONTACT_TO_EMAIL` | Destinatario interno de VERITUM |

Si no hay `RESEND_API_KEY` se usa SMTP como respaldo, y si no hay ninguno de los
dos el envío falla de forma visible: no se simula nunca un correo enviado. Cuando
Resend rechaza un envío, el cuerpo del error se registra completo, porque es la
única pista útil cuando un correo no llega (dominio sin verificar suele ser la causa).

El formulario de contacto también pasó a usar este mismo transporte: antes tenía
su propia configuración de nodemailer duplicada.

### 8.11 Seguimientos en hora de Ciudad de México

Los recordatorios siguen decidiéndose comparando contra `now()` —eso no depende
de zonas—, pero todo lo que una persona va a leer viaja además en hora de
**America/Mexico_City**:

- El payload del webhook lleva `ultimo_contacto_local`, `enviado_at_local`,
  `cliente.slot_start_local` y el campo `zona`. Los instantes en UTC siguen ahí:
  n8n redacta con los campos locales y calcula con los otros.
- `POST /api/seguimientos/contacto` acepta la fecha **con o sin desfase**. Sin
  desfase se interpreta como hora de Ciudad de México en lugar de rechazarse, que
  es lo que hacía antes.

### 8.12 Datos de contacto y agente de IA

Datos confirmados por VERITUM, con valor por omisión en
[src/lib/env.ts](src/lib/env.ts) (el mismo patrón que `modalidad`): así funcionan
aunque el build de Docker no reciba el argumento, que es el fallo que dejaba la
landing sin precio.

| Dato | Valor |
| --- | --- |
| Contacto | Lic. Miguel Martínez |
| Correo | contacto@veritum.com.mx |
| WhatsApp / agente de IA | 55 6151 0289 |

La página `/contacto` muestra ahora **los datos de contacto primero** (en el
marcado, no solo visualmente) y el formulario después, con una nota explícita de
que esa página no reserva ninguna sesión y un enlace a la agenda. El agente de IA
apunta por omisión a `https://wa.me/525561510289`.

### 8.13 Resúmenes en el panel

`/panel/resumenes` reúne lo que cada persona escribió en el formulario al
agendar, para leer los casos antes de las sesiones sin abrir cita por cita. Cuatro
filtros: próximas, con texto, con fecha encima y todas. Cada tarjeta muestra el
servicio y la situación, la fecha de la sesión con cuánto falta (destacando las de
hoy, mañana y los próximos tres días), la fecha que le corre al cliente, su
descripción completa, cuántos documentos ha subido, y enlaces a la cita y a sus
archivos.


### 8.14 Pendientes

- [ ] **`DATABASE_URL` con el hostname interno de EasyPanel.** Hoy usa
      `sslmode=disable` por internet público. Ya viajaban nombres y teléfonos; con
      el portal viajarían **demandas, citatorios y nóminas sin cifrar**. Deja de
      ser una recomendación: es bloqueante.
- [ ] **Texto de los tres documentos legales** ([content/legal.ts](content/legal.ts)).
      La landing dice «conforme a las condiciones de contratación» y esa página
      está vacía: es una promesa económica que apunta a la nada. Se añadieron las
      secciones que faltaban (documentos del portal, condiciones del crédito,
      alcance patronal, revisión prioritaria), pero siguen sin cuerpo.
- [ ] `PORTAL_SESSION_SECRET` y `BOOKING_SLOT_MINUTES=60` en EasyPanel.
- [ ] Stripe: `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`. Sin ellos no se puede
      cobrar ni probar el flujo completo de pago.
- [ ] `MEETING_URL`: sala fija de videollamada, como respaldo del enlace por cita.
- [ ] **Equipo de defensa laboral** — [content/equipo.ts](content/equipo.ts) está
      **vacío a propósito**. Para encender la sección hacen falta, por cada
      abogado: fotografía real (no de banco) en `public/equipo/`, nombre completo,
      cargo, cédula profesional y la institución que la expidió, áreas y síntesis
      curricular. Mientras esté vacío se muestra un compromiso que **sí es
      verificable** (se envía el nombre y la cédula antes de la sesión). **No
      inventar perfiles.**
- [ ] Aprobar los textos nuevos de [content/landing.ts](content/landing.ts),
      [content/productos.ts](content/productos.ts) y
      [content/portal.ts](content/portal.ts).
- [ ] Confirmar la vigencia del crédito (`CREDITO_VIGENCIA_DIAS`, hoy 90 días).
- [ ] Video de la landing (`NEXT_PUBLIC_LANDING_VIDEO`): el bloque no aparece sin él.
