import { revalidatePath } from "next/cache";
import { AlertTriangle, CheckCircle2, Clock, Webhook } from "lucide-react";
import { formatDateTimeLong } from "@/lib/booking";
import { dbReady } from "@/lib/db";
import { getSession } from "@/lib/panel-auth";
import {
  UMBRALES,
  reiniciarRecordatorios,
  resumenSeguimiento,
  tokenConfigurado,
  ultimosContactos,
  ultimosRecordatorios,
  webhookUrl,
} from "@/lib/seguimiento";
import { creditoRepresentacion, productos, situaciones } from "@content/productos";
import { formatMoney } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Acción de servidor: vuelve a comprobar la sesión, porque puede invocarse
// directamente sin pasar por la página. No usa el token de la API: esto es una
// acción del panel, no de n8n.
async function reiniciar(formData: FormData) {
  "use server";
  if (!(await getSession())) throw new Error("Sesión no válida.");
  const telefono = String(formData.get("telefono") ?? "");
  if (telefono) await reiniciarRecordatorios(telefono);
  revalidatePath("/panel/api");
}

const baseUrl = () => (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");

const horas = (minutos: number) => {
  if (minutos % 1440 === 0) return `${minutos / 1440} día${minutos / 1440 === 1 ? "" : "s"}`;
  if (minutos % 60 === 0) return `${minutos / 60} h`;
  return `${minutos} min`;
};

const inactividad = (desde: Date) => {
  const min = Math.floor((Date.now() - desde.getTime()) / 60000);
  if (min < 60) return `${min} min`;
  if (min < 1440) return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;
  return `${Math.floor(min / 1440)} d ${Math.floor((min % 1440) / 60)} h`;
};

const Codigo = ({ children }: { children: string }) => (
  <pre className="mt-3 overflow-x-auto rounded-brand bg-azul p-4 text-[0.78rem] leading-relaxed text-blanco/90 select-all">
    <code>{children}</code>
  </pre>
);

const Tarjeta = ({ titulo, valor, pie, alerta }: { titulo: string; valor: string; pie?: string; alerta?: boolean }) => (
  <div className={cn("rounded-brand border bg-blanco p-5", alerta ? "border-dorado" : "border-gris")}>
    <p className="eyebrow">{titulo}</p>
    <p className="font-display mt-2 text-[1.5rem] leading-tight text-azul">{valor}</p>
    {pie && <p className="mt-2 text-sm text-carbon/75">{pie}</p>}
  </div>
);

const Seccion = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <section className="mt-6 rounded-brand border border-gris bg-blanco p-5">
    <h2 className="font-display type-h3 text-azul">{titulo}</h2>
    {children}
  </section>
);

const Metodo = ({ metodo, ruta }: { metodo: string; ruta: string }) => (
  <p className="mt-4 flex flex-wrap items-center gap-2 text-[0.95rem]">
    <span className="rounded-brand bg-azul px-2 py-0.5 text-xs font-medium tracking-wider text-blanco">{metodo}</span>
    <code className="break-all text-azul">{ruta}</code>
  </p>
);

const distintivo: Record<string, string> = {
  enviado: "bg-azul text-blanco",
  omitido: "bg-marfil text-carbon/75",
  pendiente: "bg-marfil text-carbon/75",
  fallido: "border border-dorado bg-blanco text-azul",
};

export default async function ApiPage() {
  const url = baseUrl();
  const hookHost = (() => {
    const w = webhookUrl();
    if (!w) return null;
    try {
      return new URL(w).host;
    } catch {
      return "configurado";
    }
  })();

  const [resumen, contactos, recordatorios] = await Promise.all([
    resumenSeguimiento(),
    ultimosContactos(20),
    ultimosRecordatorios(20),
  ]);

  // Un solo lugar del que salen los importes y las condiciones que dice el bot.
  const textoBot = [
    "SERVICIOS DE DEFENSA LABORAL PARA PATRONES",
    "",
    ...productos.flatMap((p) => [
      `${p.nombre.toUpperCase()}: ${formatMoney(p.precioCentavos)} MXN`,
      p.resumen,
      ...(p.aviso ? [`Aviso: ${p.aviso}`] : []),
      "",
    ]),
    creditoRepresentacion.titulo.toUpperCase(),
    creditoRepresentacion.texto,
    "",
    "Ejemplo:",
    `  Asesoría: ${formatMoney(creditoRepresentacion.ejemplo.asesoriaCentavos)}`,
    `  Honorarios de representación: ${formatMoney(creditoRepresentacion.ejemplo.honorariosCentavos)}`,
    `  Importe a descontar: ${formatMoney(creditoRepresentacion.ejemplo.asesoriaCentavos)}`,
    `  Saldo de honorarios: ${formatMoney(creditoRepresentacion.ejemplo.saldoCentavos)}`,
    `  ${creditoRepresentacion.ejemplo.nota}`,
    "",
    "Condiciones:",
    ...creditoRepresentacion.condiciones.map((c) => `  - ${c}`),
    "",
    "LAS TRES SITUACIONES QUE ATENDEMOS",
    ...situaciones.map((s) => `  - ${s.titulo}`),
    "",
    "Atendemos SOLO del lado del patrón. No representamos a trabajadores.",
    "No prometemos resultados: la asesoría sirve para saber qué se reclama y qué opciones hay.",
  ].join("\n");

  const ejemploContacto = `curl -X POST ${url}/api/seguimientos/contacto \\
  -H "Authorization: Bearer TU_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "telefono": "+52 1 55 1234 5678",
    "ultima_hora_contacto": "2026-09-24T18:40:00-06:00"
  }'`;

  const respuestaContacto = `{
  "ok": true,
  "contacto": {
    "telefono": "+52 1 55 1234 5678",
    "telefono_normalizado": "5512345678",
    "ultimo_contacto": "2026-09-24T18:40:00.000Z",
    "recordatorios_resueltos": 0,
    "recordatorio_1_at": null,
    "recordatorio_2_at": null,
    "recordatorio_3_at": null,
    "contactos_recibidos": 3
  }
}`;

  const ejemploEstado = `curl "${url}/api/seguimientos/contacto?telefono=5512345678" \\
  -H "Authorization: Bearer TU_TOKEN"`;

  const ejemploEjecutar = `curl -X POST ${url}/api/seguimientos/ejecutar \\
  -H "Authorization: Bearer TU_TOKEN"

# Respuesta
{ "ok": true, "reclamados": 2, "enviados": 2, "fallidos": 0,
  "omitidos": 0, "reintentos": 0,
  "detalle": [ { "telefono": "5512345678", "recordatorio": 1,
                 "estado": "enviado", "http_status": 200 } ] }`;

  const cuerpoWebhook = `{
  "evento": "recordatorio_seguimiento",
  "recordatorio": 1,
  "telefono": "+52 1 55 1234 5678",
  "telefono_normalizado": "5512345678",
  "ultimo_contacto": "2026-09-24T18:40:00.000Z",
  "minutos_inactividad": 72,
  "horas_inactividad": 1.2,
  "umbral_minutos": ${UMBRALES[0]},
  "cliente": {
    "nombre": "Ana Ramírez",
    "folio": "VER-4K7P2M",
    "status": "pagada",
    "slot_start": "2026-09-26T17:00:00.000Z"
  },
  "enviado_at": "2026-09-24T19:52:00.000Z"
}`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Automatización</p>
          <h1 className="font-display type-h2 mt-1 text-azul">API y recordatorios</h1>
          <p className="mt-2 max-w-2xl text-sm text-carbon/75">
            n8n avisa cada vez que habla con una persona y aquí se guarda la hora. Si esa hora no se actualiza, el sistema
            manda un recordatorio al webhook de n8n a la hora, a las 3 horas y a las 24 horas.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tarjeta
          titulo="Token de la API"
          valor={tokenConfigurado() ? "Configurado" : "Sin configurar"}
          pie={tokenConfigurado() ? "SEGUIMIENTO_API_TOKEN" : "Las rutas responden 503 hasta que se defina."}
          alerta={!tokenConfigurado()}
        />
        <Tarjeta
          titulo="Webhook de n8n"
          valor={hookHost ?? "Sin configurar"}
          pie={hookHost ? "Destino de los recordatorios" : "Sin esto NO se manda ningún recordatorio."}
          alerta={!hookHost}
        />
        <Tarjeta
          titulo="Umbrales vigentes"
          valor={UMBRALES.map(horas).join(" · ")}
          pie="Medidos desde la última hora de contacto"
        />
        <Tarjeta
          titulo="En seguimiento"
          valor={resumen ? `${resumen.enSeguimiento} de ${resumen.contactos}` : "—"}
          pie={
            resumen
              ? `${resumen.conCita} en pausa por tener cita · ${resumen.enviados} enviados · ${resumen.fallidos} fallidos`
              : undefined
          }
        />
      </div>

      {!dbReady && (
        <p className="mt-6 rounded-brand border border-gris bg-blanco p-6 text-carbon/85">
          Falta configurar la base de datos (<code className="text-azul">DATABASE_URL</code>) para registrar contactos.
        </p>
      )}

      <Seccion titulo="Autenticación">
        <p className="mt-3 text-[0.95rem] text-carbon/85">
          Todas las rutas exigen esta cabecera. El valor se define en EasyPanel → Environment, en la variable{" "}
          <code className="text-azul">SEGUIMIENTO_API_TOKEN</code>, y no se muestra en esta página.
        </p>
        <Codigo>{`Authorization: Bearer <SEGUIMIENTO_API_TOKEN>`}</Codigo>
        <p className="mt-3 text-sm text-carbon/75">
          En n8n se guarda una sola vez como credencial <em>Header Auth</em> y se reutiliza en los dos nodos.
        </p>
      </Seccion>

      <Seccion titulo="1 · Registrar la última hora de contacto">
        <Metodo metodo="POST" ruta="/api/seguimientos/contacto" />
        <p className="mt-3 text-[0.95rem] text-carbon/85">
          Se llama al final de cada rama de n8n que hable con la persona. Reinicia el reloj de inactividad.
        </p>
        <ul className="mt-3 space-y-1.5 text-[0.9rem] text-carbon/85">
          <li>
            <code className="text-azul">telefono</code> — obligatorio. También se aceptan{" "}
            <code className="text-azul">numero</code> y <code className="text-azul">phone</code>. Cualquier formato: se
            guarda tal cual y se indexa por los 10 últimos dígitos.
          </li>
          <li>
            <code className="text-azul">ultima_hora_contacto</code> — opcional. Si no llega se usa la hora del servidor.
            Debe traer desfase horario; en n8n, <code className="text-azul">{`{{ $now.toISO() }}`}</code>.
          </li>
          <li>
            <code className="text-azul">datos</code> — opcional. Objeto libre (nombre en WhatsApp, id de conversación,
            etapa…) que se acumula en el contacto.
          </li>
        </ul>
        <Codigo>{ejemploContacto}</Codigo>
        <Codigo>{respuestaContacto}</Codigo>
        <p className="mt-3 text-sm text-carbon/75">
          Errores: <strong>401</strong> token ausente o incorrecto · <strong>422</strong> teléfono no válido o fecha sin
          desfase · <strong>429</strong> más de 120 envíos en 10 minutos · <strong>503</strong> falta configuración.
        </p>
      </Seccion>

      <Seccion titulo="2 · Consultar el estado de un teléfono">
        <Metodo metodo="GET" ruta="/api/seguimientos/contacto?telefono=5512345678" />
        <p className="mt-3 text-[0.95rem] text-carbon/85">
          Devuelve la última hora de contacto y qué recordatorios se resolvieron ya. Sirve para decidir el mensaje en n8n
          y para depurar sin entrar a la base de datos. <strong>404</strong> si no hay registro de ese teléfono.
        </p>
        <Codigo>{ejemploEstado}</Codigo>
      </Seccion>

      <Seccion titulo="3 · Ejecutar el barrido de recordatorios">
        <Metodo metodo="POST o GET" ruta="/api/seguimientos/ejecutar" />
        <p className="mt-3 text-[0.95rem] text-carbon/85">
          Esta es la ruta que llama el nodo <strong>Schedule</strong> de n8n cada 5 minutos. Pregunta a la base de datos a
          quién le toca —comparando siempre contra la hora real del servidor— manda los recordatorios y anota el
          resultado. Es seguro llamarla tantas veces como se quiera: nunca manda dos veces lo mismo.
        </p>
        <Codigo>{ejemploEjecutar}</Codigo>
        <p className="mt-3 text-sm text-carbon/75">
          Opcional: <code className="text-azul">?limite=10</code> para acotar el lote. Si ya hay un barrido corriendo
          responde <code className="text-azul">{`{ "ok": true, "enCurso": true }`}</code>.
        </p>
      </Seccion>

      <Seccion titulo="Reglas de los recordatorios">
        <div className="mt-4 overflow-hidden rounded-brand border border-gris">
          <table className="w-full border-collapse text-left text-[0.92rem]">
            <thead className="hidden sm:table-header-group">
              <tr className="border-b border-gris bg-marfil/60">
                {["Recordatorio", "Se manda cuando", "Repeticiones"].map((h) => (
                  <th key={h} scope="col" className="eyebrow px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {UMBRALES.map((m, i) => (
                <tr key={i} className="block border-b border-gris last:border-0 sm:table-row">
                  <td className="block px-4 pt-3 font-medium text-azul sm:table-cell sm:py-3">Recordatorio {i + 1}</td>
                  <td className="block px-4 sm:table-cell sm:py-3">
                    Pasan <strong>{horas(m)}</strong> sin que se actualice la hora de contacto
                  </td>
                  <td className="block px-4 pb-3 text-carbon/85 sm:table-cell sm:py-3">Una sola vez, para siempre</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-4 space-y-2 text-[0.92rem] text-carbon/85">
          <li>
            <strong>Quien ya agendó no recibe recordatorios.</strong> Si el teléfono tiene una cita pagada pendiente de
            ocurrir, o un pago en curso con la retención viva, el seguimiento se detiene: ya no hay nada que recordarle.
            No se consume nada, así que si la retención vence sin que pague, el seguimiento se reanuda solo. Una cita que
            ya ocurrió no bloquea: si después vuelve a escribir y se queda callado, tiene sentido darle seguimiento.
          </li>
          <li>
            <strong>Nunca se repiten.</strong> Una vez enviado el recordatorio 1 a un teléfono, no se le vuelve a enviar
            aunque después conteste y se quede callado de nuevo. Lo mismo con el 2 y el 3.
          </li>
          <li>
            <strong>Si la hora se actualiza</strong>, el reloj vuelve a cero y los recordatorios que aún no se hayan
            mandado se recalculan desde la hora nueva.
          </li>
          <li>
            <strong>Descartado</strong> (<code className="text-azul">omitido</code>) significa que ese recordatorio venció
            estando el sistema sin barrer y se saltó a propósito: si llegan 30 horas de silencio de golpe, se manda el de
            24 horas y no los tres seguidos. Los descartados tampoco se mandan luego.
          </li>
          <li>
            <strong>Si el webhook falla</strong>, se reintenta hasta 3 veces (a los 2 y a los 10 minutos). Agotados los
            intentos queda como <code className="text-azul">fallido</code> con el error visible más abajo, y no se vuelve
            a intentar.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="Cuerpo que recibe el webhook de n8n">
        <p className="mt-3 text-[0.95rem] text-carbon/85">
          Cada recordatorio llega como un POST con este cuerpo. <code className="text-azul">cliente</code> viene en{" "}
          <code className="text-azul">null</code> si el teléfono no coincide con ninguna cita registrada.
        </p>
        <Codigo>{cuerpoWebhook}</Codigo>
        <p className="mt-3 flex items-start gap-2 text-sm text-carbon/85">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-dorado" strokeWidth={1.75} aria-hidden />
          <span>
            El webhook de n8n no pide autenticación: quien conozca la URL puede inyectar recordatorios falsos. Define{" "}
            <code className="text-azul">SEGUIMIENTO_WEBHOOK_SECRET</code> y comprueba la cabecera{" "}
            <code className="text-azul">x-veritum-firma</code> en un nodo IF al principio del flujo.
          </span>
        </p>
      </Seccion>

      <Seccion titulo="Cómo se configura en n8n">
        <ol className="mt-4 space-y-3 text-[0.92rem] text-carbon/85">
          <li>
            <strong>Credencial.</strong> Credenciales → nueva <em>Header Auth</em>: nombre{" "}
            <code className="text-azul">Authorization</code>, valor <code className="text-azul">Bearer TU_TOKEN</code>.
          </li>
          <li>
            <strong>Registrar el contacto.</strong> Al final de cada rama que responda a la persona, un nodo{" "}
            <em>HTTP Request</em>: POST a <code className="break-all text-azul">{url}/api/seguimientos/contacto</code> con
            la credencial y el cuerpo <code className="text-azul">{`{ "telefono": "...", "ultima_hora_contacto": "{{ $now.toISO() }}" }`}</code>.
          </li>
          <li>
            <strong>Flujo aparte con el reloj.</strong> Nodo <em>Schedule</em> cada 5 minutos → nodo{" "}
            <em>HTTP Request</em> POST a <code className="break-all text-azul">{url}/api/seguimientos/ejecutar</code> con
            la misma credencial. <strong>Este flujo no es opcional:</strong> sin él los recordatorios solo salen cuando
            llega un contacto nuevo, así que un fin de semana sin mensajes los deja esperando.
          </li>
          <li>
            <strong>Recibir los recordatorios.</strong> El webhook{" "}
            {hookHost ? <code className="text-azul">{hookHost}</code> : "configurado en SEGUIMIENTO_WEBHOOK_URL"} recibe el
            POST y decide el mensaje según el campo <code className="text-azul">recordatorio</code> (1, 2 o 3).
          </li>
        </ol>
        <p className="mt-4 flex items-start gap-2 text-sm text-carbon/85">
          <Clock className="mt-0.5 size-4 shrink-0 text-dorado" strokeWidth={1.75} aria-hidden />
          <span>
            El vencimiento lo calcula siempre la base de datos comparando contra la hora real, no un temporizador dentro
            de la aplicación: reiniciar o desplegar el sitio no pierde ningún recordatorio.
          </span>
        </p>
      </Seccion>

      <Seccion titulo="Texto de los servicios y del crédito (para el bot)">
        <p className="mt-3 text-[0.95rem] text-carbon/85">
          Pega esto en el nodo de n8n que ofrece la asesoría. Sale de la misma fuente que la landing, el formulario y el
          correo de confirmación: si cambia un precio o una condición, este texto cambia en el mismo despliegue.
        </p>
        <Codigo>{textoBot}</Codigo>
      </Seccion>

      <Seccion titulo="Últimos contactos">
        {contactos.length === 0 ? (
          <p className="mt-4 text-carbon/75">Todavía no ha llegado ningún contacto desde n8n.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-brand border border-gris">
            <table className="w-full border-collapse text-left text-[0.92rem]">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-gris bg-marfil/60">
                  {["Teléfono", "Último contacto", "Inactividad", "Avisos", "Recordatorios", "Estado", ""].map((h) => (
                    <th key={h} scope="col" className="eyebrow px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contactos.map((c) => {
                  const puntos = [c.recordatorio_1_at, c.recordatorio_2_at, c.recordatorio_3_at];
                  return (
                    <tr key={c.id} className="block border-b border-gris last:border-0 sm:table-row">
                      <td className="block px-4 pt-3 sm:table-cell sm:py-3">
                        <span className="eyebrow mr-2 sm:hidden">Teléfono</span>
                        <span className="font-medium tabular-nums text-azul">{c.telefono}</span>
                      </td>
                      <td className="block px-4 sm:table-cell sm:py-3">
                        <span className="eyebrow mr-2 sm:hidden">Último contacto</span>
                        {formatDateTimeLong(c.ultimo_contacto)}
                      </td>
                      <td className="block px-4 tabular-nums sm:table-cell sm:py-3">
                        <span className="eyebrow mr-2 sm:hidden">Inactividad</span>
                        {inactividad(c.ultimo_contacto)}
                      </td>
                      <td className="block px-4 tabular-nums sm:table-cell sm:py-3">
                        <span className="eyebrow mr-2 sm:hidden">Avisos</span>
                        {c.contactos_recibidos}
                      </td>
                      <td className="block px-4 sm:table-cell sm:py-3">
                        <span className="eyebrow mr-2 sm:hidden">Recordatorios</span>
                        <span className="inline-flex items-center gap-1.5 align-middle">
                          {puntos.map((p, i) => (
                            <span
                              key={i}
                              title={p ? `Recordatorio ${i + 1}: resuelto` : `Recordatorio ${i + 1}: pendiente`}
                              className={cn("size-2.5 rounded-full", p ? "bg-dorado" : "bg-gris")}
                            />
                          ))}
                        </span>
                      </td>
                      <td className="block px-4 sm:table-cell sm:py-3">
                        <span className="eyebrow mr-2 sm:hidden">Estado</span>
                        {c.con_cita ? (
                          <span
                            className="rounded-full bg-azul px-2 py-0.5 text-xs uppercase tracking-wider text-blanco"
                            title="Ya tiene cita agendada: no se le mandan recordatorios"
                          >
                            Con cita
                          </span>
                        ) : c.recordatorios_resueltos >= 3 ? (
                          <span className="rounded-full bg-marfil px-2 py-0.5 text-xs uppercase tracking-wider text-carbon/75">
                            Agotado
                          </span>
                        ) : (
                          <span className="text-xs text-carbon/75">En seguimiento</span>
                        )}
                      </td>
                      <td className="block px-4 pb-3 sm:table-cell sm:py-3 sm:text-right">
                        {c.recordatorios_resueltos > 0 && (
                          <form action={reiniciar}>
                            <input type="hidden" name="telefono" value={c.telefono_normalizado} />
                            <button
                              type="submit"
                              className="link-text inline-block py-1 text-[0.85rem] font-medium"
                              title="Vuelve a dejar los tres recordatorios disponibles para este teléfono"
                            >
                              Reiniciar
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-sm text-carbon/75">
          <strong>Reiniciar</strong> es manual y a propósito: nada automático reactiva a nadie, pero si un cliente vuelve
          meses después puedes volver a ponerlo en seguimiento.
        </p>
      </Seccion>

      <Seccion titulo="Últimos recordatorios">
        {recordatorios.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 text-carbon/75">
            <CheckCircle2 className="size-4 text-carbon/40" strokeWidth={1.75} aria-hidden />
            Todavía no se ha mandado ningún recordatorio.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-brand border border-gris">
            <table className="w-full border-collapse text-left text-[0.92rem]">
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-gris bg-marfil/60">
                  {["Cuándo", "Teléfono", "Nº", "Estado", "Intentos", "Detalle"].map((h) => (
                    <th key={h} scope="col" className="eyebrow px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recordatorios.map((r) => (
                  <tr key={r.id} className="block border-b border-gris last:border-0 sm:table-row">
                    <td className="block px-4 pt-3 sm:table-cell sm:py-3">
                      <span className="eyebrow mr-2 sm:hidden">Cuándo</span>
                      {formatDateTimeLong(r.enviado_at ?? r.created_at)}
                    </td>
                    <td className="block px-4 tabular-nums sm:table-cell sm:py-3">
                      <span className="eyebrow mr-2 sm:hidden">Teléfono</span>
                      {r.telefono}
                    </td>
                    <td className="block px-4 tabular-nums sm:table-cell sm:py-3">
                      <span className="eyebrow mr-2 sm:hidden">Recordatorio</span>
                      {r.numero}
                    </td>
                    <td className="block px-4 sm:table-cell sm:py-3">
                      <span className="eyebrow mr-2 sm:hidden">Estado</span>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs uppercase tracking-wider", distintivo[r.estado])}>
                        {r.estado}
                      </span>
                    </td>
                    <td className="block px-4 tabular-nums sm:table-cell sm:py-3">
                      <span className="eyebrow mr-2 sm:hidden">Intentos</span>
                      {r.intentos}
                    </td>
                    <td className="block px-4 pb-3 text-xs text-carbon/75 sm:table-cell sm:py-3">
                      {r.error ? r.error : r.http_status ? `HTTP ${r.http_status}` : "—"}
                      {r.estado === "omitido" && " · descartado por atraso"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>

      <p className="mt-8 flex items-start gap-2 rounded-brand border border-gris bg-marfil/50 p-4 text-sm text-carbon/85">
        <Webhook className="mt-0.5 size-4 shrink-0 text-dorado" strokeWidth={1.75} aria-hidden />
        <span>
          Los recordatorios llevan el nombre y el folio del cliente cuando el teléfono coincide con una cita. Eso es una
          transferencia de datos personales a n8n: el aviso de privacidad debe mencionarla.
        </span>
      </p>
    </>
  );
}
