import { ImageResponse } from "next/og";
import { site } from "@content/site";

export const alt = `${site.name} — ${site.descriptor}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagen Open Graph generada: fondo azul, wordmark provisional y tagline.
// PROVISIONAL: al recibir el logotipo oficial, sustituir el wordmark por el SVG.
export default function OpenGraphImage() {
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
          color: "#F7F4ED",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 80, height: 2, background: "#CA9E32" }} />
          <div style={{ fontSize: 96, letterSpacing: 22, color: "#FFFFFF" }}>{site.name}</div>
          <div style={{ width: 80, height: 2, background: "#CA9E32" }} />
        </div>
        <div style={{ marginTop: 18, fontSize: 26, letterSpacing: 12, color: "#CA9E32", fontFamily: "Arial, sans-serif" }}>
          {site.descriptor.toUpperCase()}
        </div>
        <div style={{ marginTop: 64, fontSize: 30, color: "rgba(247,244,237,0.85)", fontFamily: "Arial, sans-serif" }}>{site.tagline}</div>
      </div>
    ),
    { ...size },
  );
}
