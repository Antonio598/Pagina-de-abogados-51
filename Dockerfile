# VERITUM — imagen de producción para EasyPanel (Next.js standalone).
# Build:  docker build -t veritum-web .
# Run:    docker run -p 3000:3000 --env-file .env veritum-web

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Dependencias -----------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# --- Build ------------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Las variables NEXT_PUBLIC_* se inyectan en tiempo de compilación:
# EasyPanel debe pasarlas como "Build arguments" además de como variables de entorno.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_TELEFONO
ARG NEXT_PUBLIC_WHATSAPP
ARG NEXT_PUBLIC_CORREO
ARG NEXT_PUBLIC_DOMICILIO
ARG NEXT_PUBLIC_HORARIO
ARG NEXT_PUBLIC_MODALIDAD
ARG NEXT_PUBLIC_MODALIDADES
ARG NEXT_PUBLIC_MODALIDADES_AGENDA
ARG NEXT_PUBLIC_REDES_LINKEDIN
ARG NEXT_PUBLIC_REDES_FACEBOOK
ARG NEXT_PUBLIC_REDES_INSTAGRAM
ARG NEXT_PUBLIC_PLAZO_RESPUESTA
ARG NEXT_PUBLIC_PRECIO_ASESORIA
ARG NEXT_PUBLIC_DURACION_ASESORIA
ARG NEXT_PUBLIC_POLITICA_CANCELACION
ARG NEXT_PUBLIC_AGENDA_URL
ARG NEXT_PUBLIC_GTM_ID
# Estas faltaban: sin declararlas como ARG, Docker ignora el argumento de build
# y la variable queda congelada como vacía en la imagen, aunque EasyPanel la
# pase. Por eso los importes de los servicios se movieron a content/productos.ts.
ARG NEXT_PUBLIC_CONTACTO_NOMBRE
ARG NEXT_PUBLIC_AGENTE_IA_URL
ARG NEXT_PUBLIC_LANDING_VIDEO
ARG NEXT_PUBLIC_LANDING_VIDEO_POSTER
RUN npm run build

# --- Runtime ----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
