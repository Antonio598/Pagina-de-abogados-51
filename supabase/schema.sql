-- ============================================================================
-- VERITUM — esquema de base de datos (Supabase / PostgreSQL)
--
-- Todo vive en el esquema `veritum`, aparte de `public`: puedes usar el mismo
-- proyecto de Supabase para otras aplicaciones sin que se mezclen.
--
-- CÓMO APLICARLO
--   1. Supabase → SQL Editor → pega este archivo completo → Run.
--      Es idempotente: puede ejecutarse varias veces sin romper nada.
--   2. Supabase → Settings → API → "Exposed schemas": añade `veritum`
--      junto a los que ya estén. SIN ESTE PASO la aplicación no podrá leer
--      ni escribir (error PGRST106).
--
-- SEGURIDAD
--   RLS activado en todas las tablas y SIN políticas públicas: solo el
--   servidor, con la service role key, puede leer y escribir. La clave anon
--   no tiene acceso a ningún dato. Nunca expongas SUPABASE_SERVICE_ROLE_KEY
--   en el navegador.
-- ============================================================================

create schema if not exists veritum;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
do $$ begin
  create type veritum.appointment_status as enum ('pendiente_pago', 'pagada', 'cancelada', 'expirada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type veritum.appointment_origin as enum ('landing', 'sitio');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Citas
-- ---------------------------------------------------------------------------
create table if not exists veritum.appointments (
  id uuid primary key default gen_random_uuid(),
  folio text not null unique,
  status veritum.appointment_status not null default 'pendiente_pago',
  origen veritum.appointment_origin not null default 'landing',

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

create index if not exists appointments_slot_start_idx on veritum.appointments (slot_start);
create index if not exists appointments_status_idx on veritum.appointments (status);
create index if not exists appointments_created_at_idx on veritum.appointments (created_at desc);

-- Un horario no puede tener dos citas que lo ocupen. Ocupan la pagada y la
-- pendiente de pago; el resto (cancelada, expirada) libera el hueco.
create unique index if not exists appointments_slot_unico
  on veritum.appointments (slot_start)
  where status in ('pagada', 'pendiente_pago');

-- ---------------------------------------------------------------------------
-- Servicio contratado y situación del patrón (defensa laboral)
--
-- Se usan text + check y no enum a propósito: un check se reemplaza con
-- drop/add en la misma ejecución idempotente de este archivo, mientras que
-- añadir un valor a un enum exige ALTER TYPE.
-- Admiten NULL porque las citas anteriores no tienen servicio ni situación.
-- ---------------------------------------------------------------------------
alter table veritum.appointments add column if not exists producto_id text;
alter table veritum.appointments add column if not exists situacion text;

alter table veritum.appointments drop constraint if exists appointments_producto_chk;
alter table veritum.appointments add constraint appointments_producto_chk
  check (producto_id is null or producto_id in ('asesoria', 'revision-prioritaria'));

alter table veritum.appointments drop constraint if exists appointments_situacion_chk;
alter table veritum.appointments add constraint appointments_situacion_chk
  check (situacion is null or situacion in ('citatorio', 'demanda', 'terminacion'));

-- ---------------------------------------------------------------------------
-- Crédito de representación
--
-- El importe pagado (precio_centavos) YA ES el crédito: no se guarda un saldo
-- aparte porque sería el mismo dato dos veces y podría desincronizarse.
-- Lo único que la base no puede deducir es hasta cuándo vale y si ya se aplicó.
--
-- credito_vence_at se fija AL PAGAR, no se calcula al leer: así un cambio
-- futuro de la política no caduca créditos que ya se vendieron.
-- ---------------------------------------------------------------------------
alter table veritum.appointments add column if not exists credito_vence_at timestamptz;
alter table veritum.appointments add column if not exists credito_aplicado_at timestamptz;
alter table veritum.appointments add column if not exists credito_asunto text;
alter table veritum.appointments add column if not exists credito_notas text;

-- Si se marca como aplicado, hay que decir a qué asunto se aplicó.
alter table veritum.appointments drop constraint if exists appointments_credito_chk;
alter table veritum.appointments add constraint appointments_credito_chk
  check (credito_aplicado_at is null or credito_asunto is not null);

-- Enlace de la videollamada. El texto del sitio lo promete desde el principio
-- y hasta ahora ningún código lo enviaba.
alter table veritum.appointments add column if not exists enlace_sesion text;

create index if not exists appointments_producto_idx on veritum.appointments (producto_id);
create index if not exists appointments_credito_pendiente_idx
  on veritum.appointments (credito_vence_at)
  where status = 'pagada' and credito_aplicado_at is null;

-- ---------------------------------------------------------------------------
-- Disponibilidad: reglas semanales
-- ---------------------------------------------------------------------------
create table if not exists veritum.availability_rules (
  id uuid primary key default gen_random_uuid(),
  -- 0 = domingo … 6 = sábado
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
create table if not exists veritum.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  inicio timestamptz not null,
  fin timestamptz not null,
  motivo text,
  created_at timestamptz not null default now(),
  check (fin > inicio)
);

create index if not exists availability_blocks_rango_idx on veritum.availability_blocks (inicio, fin);

-- ---------------------------------------------------------------------------
-- Eventos de página (medición propia, sin datos personales ni IP)
-- ---------------------------------------------------------------------------
create table if not exists veritum.page_events (
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

create index if not exists page_events_created_at_idx on veritum.page_events (created_at desc);
create index if not exists page_events_area_idx on veritum.page_events (area, created_at desc);
create index if not exists page_events_sesion_idx on veritum.page_events (session_id, path, created_at desc);

-- ---------------------------------------------------------------------------
-- Eventos de Stripe ya procesados (idempotencia del webhook)
-- ---------------------------------------------------------------------------
create table if not exists veritum.stripe_events (
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
-- ---------------------------------------------------------------------------
-- CUIDADO: `create or replace function` con una lista de argumentos DISTINTA
-- crea una SOBRECARGA, no reemplaza. Al añadir producto y situación hay que
-- borrar explícitamente la versión de 20 argumentos, o coexistirían las dos y
-- la llamada quedaría ambigua. Tras la primera ejecución esto es un no-op, así
-- que el archivo sigue siendo re-ejecutable.
-- ---------------------------------------------------------------------------
drop function if exists veritum.reservar_slot(
  text, veritum.appointment_origin, timestamptz, timestamptz, integer,
  text, text, text, text, text, text, text, text, date, text,
  integer, text, boolean, text, jsonb
);

create or replace function veritum.reservar_slot(
  p_folio text,
  p_origen veritum.appointment_origin,
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
  p_utm jsonb,
  p_producto_id text,
  p_situacion text,
  p_credito_vigencia_dias integer
) returns veritum.appointments
language plpgsql
security definer
set search_path = veritum, public
as $$
declare
  v_row veritum.appointments;
begin
  -- 1) Liberar holds vencidos (solo afecta a pendientes de pago)
  update veritum.appointments
     set status = 'expirada', updated_at = now()
   where status = 'pendiente_pago'
     and hold_expires_at is not null
     and hold_expires_at < now();

  -- 2) El horario debe seguir libre y no estar bloqueado
  if exists (
    select 1 from veritum.appointments
     where slot_start = p_slot_start
       and status in ('pagada', 'pendiente_pago')
  ) then
    return null;
  end if;

  if exists (
    select 1 from veritum.availability_blocks
     where inicio < p_slot_end and fin > p_slot_start
  ) then
    return null;
  end if;

  -- 3) Insertar la cita reteniendo el horario
  insert into veritum.appointments (
    folio, status, origen, slot_start, slot_end, hold_expires_at,
    nombre, correo, telefono, area, modalidad, entidad, municipio,
    descripcion, fecha_proxima, canal,
    precio_centavos, moneda, promo_aplicada,
    aviso_version, consentimiento_at, utm,
    producto_id, situacion, credito_vence_at
  ) values (
    p_folio, 'pendiente_pago', p_origen, p_slot_start, p_slot_end,
    now() + make_interval(mins => p_hold_minutos),
    p_nombre, p_correo, p_telefono, p_area, p_modalidad, p_entidad, p_municipio,
    p_descripcion, p_fecha_proxima, p_canal,
    p_precio_centavos, p_moneda, p_promo_aplicada,
    p_aviso_version, now(), coalesce(p_utm, '{}'::jsonb),
    p_producto_id, p_situacion,
    -- La vigencia del crédito se congela aquí, en el momento de la venta.
    now() + make_interval(days => greatest(1, coalesce(p_credito_vigencia_dias, 90)))
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
create or replace function veritum.horarios_ocupados(p_desde timestamptz, p_hasta timestamptz)
returns table (slot_start timestamptz)
language sql
stable
security definer
set search_path = veritum, public
as $$
  select a.slot_start
    from veritum.appointments a
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
create or replace function veritum.set_updated_at() returns trigger
language plpgsql
set search_path = veritum, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists appointments_updated_at on veritum.appointments;
create trigger appointments_updated_at
  before update on veritum.appointments
  for each row execute function veritum.set_updated_at();

-- ===========================================================================
-- SEGUIMIENTO DE CONTACTOS (automatización con n8n)
--
-- n8n avisa cada vez que habla con una persona (POST /api/seguimientos/contacto)
-- y aquí se guarda la hora. Si esa hora NO se actualiza, se manda un
-- recordatorio al webhook de n8n a la hora, a las 3 horas y a las 24 horas.
--
-- REGLA CENTRAL: cada recordatorio se manda UNA SOLA VEZ por teléfono, para
-- siempre. Las columnas recordatorio_N_at nunca vuelven a NULL: eso ES la
-- garantía, no una deducción.
--
-- El vencimiento se calcula SIEMPRE comparando contra now() en la base de
-- datos, nunca con temporizadores en memoria: la aplicación no tiene cron y el
-- contenedor se reinicia en cada despliegue.
-- ===========================================================================

do $$ begin
  create type veritum.recordatorio_estado as enum ('pendiente', 'enviado', 'fallido', 'omitido');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Personas en seguimiento: un renglón por teléfono
-- ---------------------------------------------------------------------------
create table if not exists veritum.contactos (
  id uuid primary key default gen_random_uuid(),

  -- Clave de la persona: los 10 últimos dígitos del teléfono. Por construcción
  -- descarta la lada de país (+52 / 52) y el 1 antiguo de los celulares.
  telefono_normalizado text not null unique check (telefono_normalizado ~ '^[0-9]{10}$'),
  -- El valor tal como lo mandó n8n, para poder responder por el mismo canal
  telefono text not null,

  -- Última hora de contacto: es el reloj de los recordatorios
  ultimo_contacto timestamptz not null default now(),

  -- Cuándo se resolvió cada recordatorio (enviado u omitido). NUNCA vuelve a NULL.
  recordatorio_1_at timestamptz,
  recordatorio_2_at timestamptz,
  recordatorio_3_at timestamptz,
  -- Cuántos de los 3 ya están resueltos. Se escribe en el mismo update que los
  -- reclama, así que no puede desincronizarse de las columnas de arriba.
  recordatorios_resueltos smallint not null default 0 check (recordatorios_resueltos between 0 and 3),

  -- Lo que n8n quiera adjuntar (nombre en WhatsApp, id de conversación, etapa…)
  datos jsonb not null default '{}'::jsonb,
  contactos_recibidos integer not null default 1,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Hace rápida la pregunta "¿a quién le toca un recordatorio?": el índice solo
-- contiene a quienes todavía tienen recordatorios pendientes.
create index if not exists contactos_pendientes_idx
  on veritum.contactos (ultimo_contacto)
  where recordatorios_resueltos < 3;

create index if not exists contactos_actualizados_idx on veritum.contactos (updated_at desc);

-- ---------------------------------------------------------------------------
-- Bitácora de recordatorios (y cola de reintentos)
--
-- Un renglón por (contacto, número). Es lo que se ve en /panel/api y lo que
-- gobierna los reintentos cuando el POST al webhook falla.
-- ---------------------------------------------------------------------------
create table if not exists veritum.recordatorios (
  id bigserial primary key,
  contacto_id uuid not null references veritum.contactos (id) on delete cascade,
  telefono_normalizado text not null,
  numero smallint not null check (numero between 1 and 3),
  estado veritum.recordatorio_estado not null default 'pendiente',

  -- Con qué valores se decidió mandarlo (el contacto puede cambiar después)
  ultimo_contacto timestamptz not null,
  minutos_inactividad integer not null,

  intentos smallint not null default 0,
  -- Cuándo volver a intentar. NULL = no se reintenta (ya se envió o se agotó).
  reintentar_at timestamptz,
  http_status integer,
  error text,
  payload jsonb,
  respuesta text,
  enviado_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- La garantía de "nunca dos veces", también a nivel de bitácora
  unique (contacto_id, numero)
);

create index if not exists recordatorios_created_at_idx on veritum.recordatorios (created_at desc);
create index if not exists recordatorios_reintento_idx
  on veritum.recordatorios (reintentar_at)
  where estado = 'fallido' and reintentar_at is not null;

-- Para cruzar un teléfono normalizado con las citas, que lo guardan tal como lo
-- escribió la persona. La expresión es inmutable, así que se puede indexar.
create index if not exists appointments_telefono_norm_idx
  on veritum.appointments (right(regexp_replace(telefono, '[^0-9]', '', 'g'), 10));

-- ---------------------------------------------------------------------------
-- ¿Esta persona ya tiene una cita agendada?
--
-- Si la tiene, no se le mandan recordatorios: el seguimiento existe para que
-- agende, y ya agendó. Cuenta como cita agendada:
--   · una cita PAGADA que todavía no ha ocurrido, y
--   · una cita en proceso de pago cuya retención sigue viva (está en la pasarela
--     ahora mismo; si no paga y la retención vence, el seguimiento se reanuda).
--
-- Una cita pagada que ya ocurrió NO bloquea: si después de su asesoría la
-- persona vuelve a escribir y se queda callada, el seguimiento tiene sentido.
--
-- El cruce se hace por los 10 últimos dígitos, porque las citas guardan el
-- teléfono tal como lo escribió la persona. Usa appointments_telefono_norm_idx.
-- ---------------------------------------------------------------------------
create or replace function veritum.tiene_cita_agendada(p_telefono_normalizado text)
returns boolean
language sql
stable
security definer
set search_path = veritum, public
as $$
  select exists (
    select 1
      from veritum.appointments a
     where right(regexp_replace(a.telefono, '[^0-9]', '', 'g'), 10) = p_telefono_normalizado
       and (
         (a.status = 'pagada' and a.slot_start >= now())
         or (a.status = 'pendiente_pago' and a.hold_expires_at > now())
       )
  );
$$;

-- ---------------------------------------------------------------------------
-- Reclamo atómico de recordatorios
--
-- Devuelve los recordatorios que hay que mandar YA, dejándolos marcados como
-- resueltos ANTES de la llamada HTTP. Dos barridos simultáneos no pueden
-- reclamar el mismo: for update skip locked más las columnas ya escritas.
--
-- Elige el recordatorio MÁS ALTO ya vencido y marca como 'omitido' los menores
-- vencidos y sin mandar: si el barrido estuvo caído 30 horas, la persona recibe
-- el de 24 horas (el relevante) y no los tres seguidos.
--
-- Los nombres de salida llevan prefijo o_ a propósito: en plpgsql los
-- parámetros de salida son variables y colisionarían con los nombres de columna
-- dentro de las consultas.
-- ---------------------------------------------------------------------------
create or replace function veritum.reclamar_recordatorios(
  p_min1 integer,
  p_min2 integer,
  p_min3 integer,
  p_limite integer
) returns table (
  o_recordatorio_id bigint,
  o_contacto_id uuid,
  o_telefono text,
  o_telefono_normalizado text,
  o_numero smallint,
  o_ultimo_contacto timestamptz,
  o_minutos_inactividad integer,
  o_omitidos smallint[]
)
language plpgsql
security definer
set search_path = veritum, public
as $$
declare
  c record;
  v_numero smallint;
  v_omitidos smallint[];
  v_minutos integer;
  v_id bigint;
  v_ahora timestamptz := now();
begin
  for c in
    select x.id, x.telefono, x.telefono_normalizado, x.ultimo_contacto,
           x.recordatorio_1_at, x.recordatorio_2_at, x.recordatorio_3_at
      from veritum.contactos x
     where x.recordatorios_resueltos < 3
       and x.ultimo_contacto <= v_ahora - make_interval(mins => p_min1)
       -- Quien ya tiene cita agendada no se persigue. Se SALTA, no se consume:
       -- los recordatorios siguen disponibles, así que si la retención del pago
       -- vence sin pagar, el seguimiento se reanuda solo.
       and not veritum.tiene_cita_agendada(x.telefono_normalizado)
     order by x.ultimo_contacto asc
     limit greatest(1, p_limite)
     for update skip locked
  loop
    v_numero := null;
    v_omitidos := '{}'::smallint[];

    if c.recordatorio_3_at is null and c.ultimo_contacto <= v_ahora - make_interval(mins => p_min3) then
      v_numero := 3;
    elsif c.recordatorio_2_at is null and c.ultimo_contacto <= v_ahora - make_interval(mins => p_min2) then
      v_numero := 2;
    elsif c.recordatorio_1_at is null and c.ultimo_contacto <= v_ahora - make_interval(mins => p_min1) then
      v_numero := 1;
    end if;

    if v_numero is null then
      continue;
    end if;

    -- Los menores que ya vencieron y nunca se mandaron se descartan: no se
    -- avisa que hace una hora que no se habla cuando ya pasaron 30 horas.
    if v_numero > 1 and c.recordatorio_1_at is null then
      v_omitidos := v_omitidos || 1::smallint;
    end if;
    if v_numero > 2 and c.recordatorio_2_at is null then
      v_omitidos := v_omitidos || 2::smallint;
    end if;

    v_minutos := floor(extract(epoch from (v_ahora - c.ultimo_contacto)) / 60)::integer;

    update veritum.contactos w
       set recordatorio_1_at = case when v_numero = 1 or 1 = any(v_omitidos) then v_ahora else w.recordatorio_1_at end,
           recordatorio_2_at = case when v_numero = 2 or 2 = any(v_omitidos) then v_ahora else w.recordatorio_2_at end,
           recordatorio_3_at = case when v_numero = 3                        then v_ahora else w.recordatorio_3_at end,
           recordatorios_resueltos = w.recordatorios_resueltos + 1 + coalesce(cardinality(v_omitidos), 0),
           updated_at = v_ahora
     where w.id = c.id;

    -- Bitácora de los descartados
    if coalesce(cardinality(v_omitidos), 0) > 0 then
      insert into veritum.recordatorios
        (contacto_id, telefono_normalizado, numero, estado, ultimo_contacto, minutos_inactividad, reintentar_at)
      select c.id, c.telefono_normalizado, u.n, 'omitido', c.ultimo_contacto, v_minutos, null
        from unnest(v_omitidos) as u(n)
      on conflict (contacto_id, numero) do nothing;
    end if;

    -- Bitácora del que sí se manda: queda 'pendiente' hasta saber el resultado.
    -- v_id se limpia antes porque un on conflict do nothing que no inserta nada
    -- deja la variable con su valor anterior.
    v_id := null;
    insert into veritum.recordatorios
      (contacto_id, telefono_normalizado, numero, estado, ultimo_contacto, minutos_inactividad)
    values
      (c.id, c.telefono_normalizado, v_numero, 'pendiente', c.ultimo_contacto, v_minutos)
    on conflict (contacto_id, numero) do nothing
    returning id into v_id;

    -- Ya existía: otro barrido lo tomó. No se manda nada.
    if v_id is null then
      continue;
    end if;

    return query select v_id, c.id, c.telefono, c.telefono_normalizado,
                        v_numero, c.ultimo_contacto, v_minutos, v_omitidos;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Reclamo de reintentos
--
-- Dos casos: el POST falló y todavía queda intento, o el proceso murió con el
-- POST en vuelo y el renglón quedó 'pendiente' (huérfano).
--
-- Nunca se devuelve a NULL el recordatorio_N_at del contacto: el reintento se
-- gobierna desde esta bitácora, no reabriendo el hueco. Así "nunca dos veces"
-- sigue siendo cierto aunque la red falle.
-- ---------------------------------------------------------------------------
create or replace function veritum.reclamar_reintentos(
  p_max_intentos integer,
  p_huerfano_min integer,
  p_limite integer
) returns table (
  o_recordatorio_id bigint,
  o_contacto_id uuid,
  o_telefono text,
  o_telefono_normalizado text,
  o_numero smallint,
  o_ultimo_contacto timestamptz,
  o_minutos_inactividad integer,
  o_intentos smallint
)
language sql
security definer
set search_path = veritum, public
as $$
  update veritum.recordatorios r
     set estado = 'pendiente', reintentar_at = null, updated_at = now()
    from veritum.contactos c
   where c.id = r.contacto_id
     and r.id in (
       select r2.id
         from veritum.recordatorios r2
        where (
                (r2.estado = 'fallido'
                 and r2.intentos < p_max_intentos
                 and r2.reintentar_at is not null
                 and r2.reintentar_at <= now())
             or (r2.estado = 'pendiente'
                 and r2.updated_at < now() - make_interval(mins => p_huerfano_min))
              )
          -- Si agendó entre el intento fallido y el reintento, ya no se manda.
          -- El paréntesis de arriba es necesario: sin él este `and` se pegaría
          -- solo a la segunda rama del `or`.
          and not veritum.tiene_cita_agendada(r2.telefono_normalizado)
        order by r2.created_at asc
        limit greatest(1, p_limite)
        for update skip locked
     )
  returning r.id, c.id, c.telefono, r.telefono_normalizado,
            r.numero, r.ultimo_contacto, r.minutos_inactividad, r.intentos;
$$;

drop trigger if exists contactos_updated_at on veritum.contactos;
create trigger contactos_updated_at
  before update on veritum.contactos
  for each row execute function veritum.set_updated_at();

drop trigger if exists recordatorios_updated_at on veritum.recordatorios;
create trigger recordatorios_updated_at
  before update on veritum.recordatorios
  for each row execute function veritum.set_updated_at();

-- ===========================================================================
-- DOCUMENTOS DEL PORTAL DEL CLIENTE
--
-- El cliente entra a /portal con su teléfono y el folio que recibió al pagar, y
-- carga la documentación de su asunto (citatorio, demanda, nómina…).
--
-- El contenido vive en la BASE DE DATOS y no en disco: el contenedor corre como
-- usuario sin privilegios, no tiene directorio escribible y no hay volumen
-- montado, así que cualquier archivo en disco desaparecería en el despliegue.
--
-- REGLA DE USO: la columna `contenido` NUNCA se incluye en un `select *`. Solo
-- la lee la ruta de descarga, por id. Postgres la guarda fuera de línea
-- (TOAST), de modo que listar cientos de documentos no mueve un solo byte.
--
-- El cruce con el cliente es por los 10 últimos dígitos del teléfono, igual que
-- en contactos y en tiene_cita_agendada: una persona puede tener varias citas y
-- los documentos son de la persona, no de una cita concreta.
-- ===========================================================================
create table if not exists veritum.documentos (
  id uuid primary key default gen_random_uuid(),

  -- Clave canónica de la persona, siempre presente
  telefono_normalizado text not null check (telefono_normalizado ~ '^[0-9]{10}$'),
  -- Cita con la que entró al portal. Si la cita se borra el documento
  -- permanece: sigue siendo del cliente.
  appointment_id uuid references veritum.appointments (id) on delete set null,
  folio text,

  nombre_archivo text not null check (length(nombre_archivo) between 1 and 160),
  extension text not null,
  mime text not null,
  -- El tope de 15 MB se garantiza también aquí, no solo en la aplicación.
  tamano_bytes integer not null check (tamano_bytes > 0 and tamano_bytes <= 15728640),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  contenido bytea not null,

  subido_por text not null default 'cliente' check (subido_por in ('cliente', 'despacho')),
  etiqueta text,
  notas text,
  -- Borrado suave: un documento de un expediente no se destruye sin dejar rastro.
  eliminado_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documentos_cliente_idx
  on veritum.documentos (telefono_normalizado, created_at desc)
  where eliminado_at is null;
create index if not exists documentos_folio_idx on veritum.documentos (folio);
create index if not exists documentos_created_at_idx on veritum.documentos (created_at desc);

drop trigger if exists documentos_updated_at on veritum.documentos;
create trigger documentos_updated_at
  before update on veritum.documentos
  for each row execute function veritum.set_updated_at();

-- ---------------------------------------------------------------------------
-- Permisos: la API solo necesita entrar al esquema; RLS bloquea el resto.
-- ---------------------------------------------------------------------------
grant usage on schema veritum to anon, authenticated, service_role;
grant all on all tables in schema veritum to service_role;
grant all on all sequences in schema veritum to service_role;
grant execute on all functions in schema veritum to service_role;

alter table veritum.appointments enable row level security;
alter table veritum.availability_rules enable row level security;
alter table veritum.availability_blocks enable row level security;
alter table veritum.page_events enable row level security;
alter table veritum.stripe_events enable row level security;
alter table veritum.contactos enable row level security;
alter table veritum.recordatorios enable row level security;
alter table veritum.documentos enable row level security;

-- ---------------------------------------------------------------------------
-- Disponibilidad inicial de ejemplo (lunes a viernes, 10:00–14:00 y 16:00–18:00
-- hora de la Ciudad de México). Edítala desde el panel: /panel/disponibilidad
-- ---------------------------------------------------------------------------
insert into veritum.availability_rules (weekday, hora_inicio, hora_fin)
select d, h.inicio, h.fin
  from generate_series(1, 5) as d,
       (values ('10:00'::time, '14:00'::time), ('16:00'::time, '18:00'::time)) as h(inicio, fin)
 where not exists (select 1 from veritum.availability_rules);
