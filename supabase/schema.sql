-- ============================================================================
-- VERITUM — esquema de base de datos (Supabase / PostgreSQL)
--
-- Cómo aplicarlo:
--   Supabase → SQL Editor → pega este archivo completo → Run.
--   Es idempotente: puede ejecutarse varias veces sin romper nada.
--
-- Seguridad: RLS activado en todas las tablas y SIN políticas públicas.
-- Solo el servidor (service role key) puede leer y escribir. La clave anon
-- no tiene acceso a ningún dato. Nunca expongas SUPABASE_SERVICE_ROLE_KEY
-- en el navegador.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
do $$ begin
  create type appointment_status as enum ('pendiente_pago', 'pagada', 'cancelada', 'expirada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_origin as enum ('landing', 'sitio');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Citas
-- ---------------------------------------------------------------------------
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique,
  status appointment_status not null default 'pendiente_pago',
  origen appointment_origin not null default 'landing',

  -- Horario reservado (siempre en UTC; la zona de trabajo se aplica al mostrar)
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  -- Mientras no se pague, la cita retiene el horario hasta esta hora
  hold_expires_at timestamptz,

  -- Datos del formulario
  nombre text not null,
  correo text not null,
  telefono text not null,
  area text not null,
  modalidad text,
  entidad text,
  municipio text,
  descripcion text,
  fecha_proxima date,
  canal text,

  -- Cobro
  precio_centavos integer not null,
  moneda text not null default 'MXN',
  promo_aplicada boolean not null default false,
  stripe_session_id text unique,
  stripe_payment_intent text,
  paid_at timestamptz,

  -- Consentimiento y procedencia (sin IP en claro)
  aviso_version text,
  consentimiento_at timestamptz,
  utm jsonb not null default '{}'::jsonb,

  -- Notas internas del panel
  notas text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_slot_start_idx on appointments (slot_start);
create index if not exists appointments_status_idx on appointments (status);
create index if not exists appointments_created_at_idx on appointments (created_at desc);

-- Un horario no puede tener dos citas que lo ocupen. Ocupan la pagada y la
-- pendiente de pago cuyo hold sigue vigente; el resto (cancelada, expirada) no.
create unique index if not exists appointments_slot_unico
  on appointments (slot_start)
  where status in ('pagada', 'pendiente_pago');

-- ---------------------------------------------------------------------------
-- Disponibilidad: reglas semanales
-- ---------------------------------------------------------------------------
create table if not exists availability_rules (
  id uuid primary key default gen_random_uuid(),
  -- 0 = domingo … 6 = sábado (igual que JS getDay en la zona de trabajo)
  weekday smallint not null check (weekday between 0 and 6),
  hora_inicio time not null,
  hora_fin time not null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  check (hora_fin > hora_inicio)
);

-- ---------------------------------------------------------------------------
-- Disponibilidad: bloqueos puntuales (vacaciones, audiencias, etc.)
-- ---------------------------------------------------------------------------
create table if not exists availability_blocks (
  id uuid primary key default gen_random_uuid(),
  inicio timestamptz not null,
  fin timestamptz not null,
  motivo text,
  created_at timestamptz not null default now(),
  check (fin > inicio)
);

create index if not exists availability_blocks_rango_idx on availability_blocks (inicio, fin);

-- ---------------------------------------------------------------------------
-- Eventos de página (medición propia, sin datos personales ni IP)
-- ---------------------------------------------------------------------------
create table if not exists page_events (
  id bigserial primary key,
  session_id text not null,
  path text not null,
  area text not null check (area in ('sitio', 'landing', 'panel')),
  referrer_host text,
  device text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  duracion_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists page_events_created_at_idx on page_events (created_at desc);
create index if not exists page_events_area_idx on page_events (area, created_at desc);
create unique index if not exists page_events_session_path_idx on page_events (session_id, path, created_at);

-- ---------------------------------------------------------------------------
-- Eventos de Stripe ya procesados (idempotencia del webhook)
-- ---------------------------------------------------------------------------
create table if not exists stripe_events (
  id text primary key,
  tipo text not null,
  procesado_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Reserva atómica de un horario
--
-- Expira los holds vencidos y, en la misma transacción, inserta la cita solo
-- si el horario sigue libre. Si otra persona lo tomó, devuelve NULL y la API
-- responde "ese horario ya no está disponible".
-- ---------------------------------------------------------------------------
create or replace function reservar_slot(
  p_folio text,
  p_origen appointment_origin,
  p_slot_start timestamptz,
  p_slot_end timestamptz,
  p_hold_minutos integer,
  p_nombre text,
  p_correo text,
  p_telefono text,
  p_area text,
  p_modalidad text,
  p_entidad text,
  p_municipio text,
  p_descripcion text,
  p_fecha_proxima date,
  p_canal text,
  p_precio_centavos integer,
  p_moneda text,
  p_promo_aplicada boolean,
  p_aviso_version text,
  p_utm jsonb
) returns appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row appointments;
begin
  -- 1) Liberar holds vencidos (solo afecta a pendientes de pago)
  update appointments
     set status = 'expirada', updated_at = now()
   where status = 'pendiente_pago'
     and hold_expires_at is not null
     and hold_expires_at < now();

  -- 2) El horario debe seguir libre y no estar bloqueado
  if exists (
    select 1 from appointments
     where slot_start = p_slot_start
       and status in ('pagada', 'pendiente_pago')
  ) then
    return null;
  end if;

  if exists (
    select 1 from availability_blocks
     where inicio < p_slot_end and fin > p_slot_start
  ) then
    return null;
  end if;

  -- 3) Insertar la cita reteniendo el horario
  insert into appointments (
    folio, status, origen, slot_start, slot_end, hold_expires_at,
    nombre, correo, telefono, area, modalidad, entidad, municipio,
    descripcion, fecha_proxima, canal,
    precio_centavos, moneda, promo_aplicada,
    aviso_version, consentimiento_at, utm
  ) values (
    p_folio, 'pendiente_pago', p_origen, p_slot_start, p_slot_end,
    now() + make_interval(mins => p_hold_minutos),
    p_nombre, p_correo, p_telefono, p_area, p_modalidad, p_entidad, p_municipio,
    p_descripcion, p_fecha_proxima, p_canal,
    p_precio_centavos, p_moneda, p_promo_aplicada,
    p_aviso_version, now(), coalesce(p_utm, '{}'::jsonb)
  )
  returning * into v_row;

  return v_row;
exception
  when unique_violation then
    -- Otra persona tomó el mismo horario en el mismo instante
    return null;
end;
$$;

-- ---------------------------------------------------------------------------
-- Horarios ocupados de un rango (para calcular disponibilidad)
-- ---------------------------------------------------------------------------
create or replace function horarios_ocupados(p_desde timestamptz, p_hasta timestamptz)
returns table (slot_start timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select a.slot_start
    from appointments a
   where a.slot_start >= p_desde
     and a.slot_start < p_hasta
     and (
       a.status = 'pagada'
       or (a.status = 'pendiente_pago' and a.hold_expires_at > now())
     );
$$;

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists appointments_updated_at on appointments;
create trigger appointments_updated_at
  before update on appointments
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: activado y sin políticas. Solo la service role key (servidor) accede.
-- ---------------------------------------------------------------------------
alter table appointments enable row level security;
alter table availability_rules enable row level security;
alter table availability_blocks enable row level security;
alter table page_events enable row level security;
alter table stripe_events enable row level security;

-- ---------------------------------------------------------------------------
-- Disponibilidad inicial de ejemplo (lunes a viernes, 10:00–14:00 y 16:00–18:00
-- hora de la Ciudad de México). Edítala desde el panel: /panel/disponibilidad
-- ---------------------------------------------------------------------------
insert into availability_rules (weekday, hora_inicio, hora_fin)
select d, h.inicio, h.fin
  from generate_series(1, 5) as d,
       (values ('10:00'::time, '14:00'::time), ('16:00'::time, '18:00'::time)) as h(inicio, fin)
 where not exists (select 1 from availability_rules);
