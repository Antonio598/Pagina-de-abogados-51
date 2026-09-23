import { revalidatePath } from "next/cache";
import { CalendarClock } from "lucide-react";
import { formatDateTimeLong, SLOT_MINUTES } from "@/lib/booking";
import { db, dbReady, t, type AvailabilityBlock, type AvailabilityRule } from "@/lib/db";
import { getSession } from "@/lib/panel-auth";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/forms/Field";

export const dynamic = "force-dynamic";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Acciones de servidor: cada una vuelve a comprobar la sesión, porque una
// acción puede invocarse directamente sin pasar por la página.
async function agregarRegla(formData: FormData) {
  "use server";
  if (!(await getSession())) throw new Error("Sesión no válida.");
  const weekday = Number(formData.get("weekday"));
  const inicio = String(formData.get("hora_inicio") ?? "");
  const fin = String(formData.get("hora_fin") ?? "");
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return;
  if (!/^\d{2}:\d{2}$/.test(inicio) || !/^\d{2}:\d{2}$/.test(fin) || fin <= inicio) return;
  await db()`
    insert into ${t("availability_rules")} (weekday, hora_inicio, hora_fin)
    values (${weekday}, ${inicio}::time, ${fin}::time)`;
  revalidatePath("/panel/disponibilidad");
}

async function borrarRegla(formData: FormData) {
  "use server";
  if (!(await getSession())) throw new Error("Sesión no válida.");
  const id = String(formData.get("id") ?? "");
  if (id) await db()`delete from ${t("availability_rules")} where id = ${id}::uuid`;
  revalidatePath("/panel/disponibilidad");
}

async function agregarBloqueo(formData: FormData) {
  "use server";
  if (!(await getSession())) throw new Error("Sesión no válida.");
  const inicio = String(formData.get("inicio") ?? "");
  const fin = String(formData.get("fin") ?? "");
  const motivo = String(formData.get("motivo") ?? "").slice(0, 120);
  if (!inicio || !fin || new Date(fin) <= new Date(inicio)) return;
  await db()`
    insert into ${t("availability_blocks")} (inicio, fin, motivo)
    values (${new Date(inicio)}, ${new Date(fin)}, ${motivo || null})`;
  revalidatePath("/panel/disponibilidad");
}

async function borrarBloqueo(formData: FormData) {
  "use server";
  if (!(await getSession())) throw new Error("Sesión no válida.");
  const id = String(formData.get("id") ?? "");
  if (id) await db()`delete from ${t("availability_blocks")} where id = ${id}::uuid`;
  revalidatePath("/panel/disponibilidad");
}

export default async function DisponibilidadPage() {
  if (!dbReady) {
    return (
      <p className="rounded-brand border border-gris bg-blanco p-6 text-carbon/85">
        Falta configurar la base de datos (<code className="text-azul">DATABASE_URL</code>) para gestionar los horarios.
      </p>
    );
  }

  const sql = db();
  const [reglas, bloqueos] = await Promise.all([
    sql<AvailabilityRule[]>`select * from ${t("availability_rules")} order by weekday, hora_inicio`,
    sql<AvailabilityBlock[]>`select * from ${t("availability_blocks")} where fin >= now() order by inicio`,
  ]);

  return (
    <>
      <p className="eyebrow">Agenda</p>
      <h1 className="font-display type-h2 mt-1 text-azul">Horarios disponibles</h1>
      <p className="mt-2 max-w-2xl text-sm text-carbon/75">
        Cada franja se divide en sesiones de {SLOT_MINUTES} minutos. Solo se ofrecen horarios libres, con al menos dos horas de
        anticipación y que no choquen con un bloqueo.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Reglas semanales */}
        <section className="rounded-brand border border-gris bg-blanco p-5">
          <h2 className="font-display type-h3 text-azul">Semana habitual</h2>

          <ul className="mt-4 divide-y divide-gris">
            {reglas.length === 0 && <li className="py-3 text-carbon/75">Sin horarios definidos: la agenda está cerrada.</li>}
            {reglas.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-3">
                <span className="text-[0.98rem] text-carbon/90">
                  <strong className="font-medium text-azul">{DIAS[r.weekday]}</strong>{" "}
                  <span className="tabular-nums">
                    {r.hora_inicio.slice(0, 5)} – {r.hora_fin.slice(0, 5)}
                  </span>
                </span>
                <form action={borrarRegla}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="min-h-10 px-2 text-sm text-[#8a2f2f] underline-offset-4 hover:underline">Quitar</button>
                </form>
              </li>
            ))}
          </ul>

          <form action={agregarRegla} className="mt-6 space-y-4 border-t border-gris pt-5">
            <Select
              id="weekday"
              name="weekday"
              label="Día"
              options={DIAS.map((d, i) => ({ value: String(i), label: d }))}
              defaultValue="1"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input id="hora_inicio" name="hora_inicio" label="Desde" type="time" step={900} defaultValue="10:00" required />
              <Input id="hora_fin" name="hora_fin" label="Hasta" type="time" step={900} defaultValue="14:00" required />
            </div>
            <Button type="submit" className="w-full">
              Agregar franja
            </Button>
          </form>
        </section>

        {/* Bloqueos */}
        <section className="rounded-brand border border-gris bg-blanco p-5">
          <h2 className="font-display type-h3 flex items-center gap-2 text-azul">
            <CalendarClock className="size-5 text-dorado-2" strokeWidth={1.75} aria-hidden />
            Bloqueos puntuales
          </h2>
          <p className="mt-2 text-sm text-carbon/75">Audiencias, vacaciones o cualquier periodo en el que no quieras recibir citas.</p>

          <ul className="mt-4 divide-y divide-gris">
            {bloqueos.length === 0 && <li className="py-3 text-carbon/75">Sin bloqueos próximos.</li>}
            {bloqueos.map((b) => (
              <li key={b.id} className="flex items-start justify-between gap-4 py-3">
                <span className="text-[0.95rem] text-carbon/90">
                  {formatDateTimeLong(b.inicio)} → {formatDateTimeLong(b.fin)}
                  {b.motivo && <span className="block text-sm text-carbon/70">{b.motivo}</span>}
                </span>
                <form action={borrarBloqueo}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="min-h-10 px-2 text-sm text-[#8a2f2f] underline-offset-4 hover:underline">Quitar</button>
                </form>
              </li>
            ))}
          </ul>

          <form action={agregarBloqueo} className="mt-6 space-y-4 border-t border-gris pt-5">
            <Input id="inicio" name="inicio" label="Desde" type="datetime-local" required />
            <Input id="fin" name="fin" label="Hasta" type="datetime-local" required />
            <Input id="motivo" name="motivo" label="Motivo" optional maxLength={120} />
            <Button type="submit" className="w-full">
              Agregar bloqueo
            </Button>
          </form>
        </section>
      </div>
    </>
  );
}
