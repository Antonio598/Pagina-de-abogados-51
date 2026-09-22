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

- [ ] **Logotipo oficial (SVG)** — hoy hay un wordmark provisional en `src/components/layout/Logo.tsx`, `public/icon.svg` y `src/app/opengraph-image.tsx` (buscar `PROVISIONAL`). Sustituir por el archivo oficial sin redibujarlo.
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
src/components/forms/    ContactForm, AgendaFlow, campos accesibles
src/components/motion/   Reveal, Stagger, DrawLine, useScrollProgress (CSS + IntersectionObserver; respetan prefers-reduced-motion)
src/lib/                 env, analytics, schema (JSON-LD), validación (zod), utils
```

## 7. Accesibilidad y rendimiento

Lighthouse móvil (simulación 4G lenta, CPU ×4): rendimiento 86–97, accesibilidad 100, buenas prácticas 100, SEO 100. Sin desbordes horizontales desde 360 px; objetivos de toque ≥ 40 px en navegación, filtros y formularios.

Navegación completa por teclado (menú móvil con trampa de foco y Esc), foco visible con anillo dorado, contraste AA (el dorado nunca se usa en texto de cuerpo), un H1 por página, etiquetas asociadas a cada campo, errores junto al campo, `prefers-reduced-motion` respetado, sin parallax, sin video, sin carruseles, sin pop-ups. Fuentes: Inter + Fraunces vía `next/font` (dos familias máximo).
