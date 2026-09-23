import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@content/site";

export const alt = `${site.name} — ${site.descriptor}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagen que se ve al compartir el enlace: logotipo oficial sobre azul profundo.
export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/veritum-logo-880.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D224C",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* El logotipo va sobre una superficie clara: no existe versión invertida. */}
        <div style={{ display: "flex", background: "#F7F4ED", borderRadius: 12, padding: "40px 56px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no usa next/image */}
          <img src={src} alt="" width={720} height={158} />
        </div>
        <div style={{ marginTop: 56, fontSize: 30, color: "rgba(247,244,237,0.85)", textAlign: "center", maxWidth: 900 }}>
          {site.tagline}
        </div>
        <div style={{ marginTop: 20, width: 120, height: 2, background: "#CA9E32" }} />
      </div>
    ),
    { ...size },
  );
}
