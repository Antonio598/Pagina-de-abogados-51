// Genera los archivos derivados del logotipo oficial.
//
// Fuente única: public/brand/veritum-logo-master.png (archivo entregado por VERITUM).
// Este script NO redibuja, NO recolorea y NO deforma nada: solo redimensiona el
// logotipo y aísla el emblema del propio archivo original para los íconos.
//
// Uso:  node scripts/generate-brand-assets.mjs
// Vuelve a ejecutarlo si VERITUM entrega una versión nueva del logotipo.

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const MASTER = "public/brand/veritum-logo-master.png";
const OUT = "public";
const MARFIL = { r: 0xf7, g: 0xf4, b: 0xed, alpha: 1 };
const TRANSPARENTE = { r: 0, g: 0, b: 0, alpha: 0 };

await mkdir(`${OUT}/brand`, { recursive: true });

// --- Logotipo horizontal completo -------------------------------------------
// Se recortan los márgenes transparentes del original para controlar el área de
// protección desde el CSS. PNG con paleta: aquí pesa menos que WebP.
const recortado = await sharp(MASTER).trim({ threshold: 10 }).toBuffer();
const meta = await sharp(recortado).metadata();
console.log(`Logotipo: ${meta.width}x${meta.height}`);

for (const w of [440, 880]) {
  await sharp(recortado)
    .resize({ width: w, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(`${OUT}/brand/veritum-logo-${w}.png`);
}

// --- Emblema para favicon, avatar e íconos de móvil ---------------------------
// Se aísla la forma completa más grande del archivo oficial (el símbolo "V"),
// sin tocar sus colores. Es un recorte del original, no un dibujo nuevo:
// sustitúyelo en cuanto VERITUM entregue su versión simplificada oficial.
const { data, info } = await sharp(recortado).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const opaco = (x, y) => data[(y * W + x) * 4 + 3] > 40;

// Componentes conexos sobre la máscara de opacidad; nos quedamos con el mayor,
// que es el emblema (las letras y las líneas son componentes independientes).
const etiqueta = new Int32Array(W * H).fill(-1);
let mejor = { id: -1, area: 0, x0: W, y0: H, x1: 0, y1: 0 };
let id = 0;
const cola = new Int32Array(W * H);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const inicio = y * W + x;
    if (etiqueta[inicio] !== -1 || !opaco(x, y)) continue;
    let cabeza = 0;
    let fin = 0;
    cola[fin++] = inicio;
    etiqueta[inicio] = id;
    const caja = { area: 0, x0: x, y0: y, x1: x, y1: y };
    while (cabeza < fin) {
      const p = cola[cabeza++];
      const py = (p / W) | 0;
      const px = p - py * W;
      caja.area++;
      if (px < caja.x0) caja.x0 = px;
      if (px > caja.x1) caja.x1 = px;
      if (py < caja.y0) caja.y0 = py;
      if (py > caja.y1) caja.y1 = py;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = px + dx;
        const ny = py + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const np = ny * W + nx;
        if (etiqueta[np] !== -1 || !opaco(nx, ny)) continue;
        etiqueta[np] = id;
        cola[fin++] = np;
      }
    }
    if (caja.area > mejor.area) mejor = { id, ...caja };
    id++;
  }
}

const anchoEm = mejor.x1 - mejor.x0 + 1;
const altoEm = mejor.y1 - mejor.y0 + 1;
console.log(`Emblema aislado: ${anchoEm}x${altoEm} (componente de ${mejor.area} px)`);

// Copiamos solo los píxeles del emblema, sin arrastrar otros elementos del logo.
const soloEmblema = Buffer.alloc(anchoEm * altoEm * 4);
for (let y = 0; y < altoEm; y++) {
  for (let x = 0; x < anchoEm; x++) {
    const origen = (y + mejor.y0) * W + (x + mejor.x0);
    if (etiqueta[origen] !== mejor.id) continue;
    soloEmblema.set(data.subarray(origen * 4, origen * 4 + 4), (y * anchoEm + x) * 4);
  }
}

const emblema = await sharp(soloEmblema, { raw: { width: anchoEm, height: altoEm, channels: 4 } }).png().toBuffer();

// Cuadrado con área de protección alrededor del emblema (14 % del lado).
const lado = Math.max(anchoEm, altoEm);
const margen = Math.round(lado * 0.14);
const cuadrado = (fondo, aplanar) => {
  const base = sharp(emblema)
    .resize({ width: lado, height: lado, fit: "contain", background: TRANSPARENTE })
    .extend({ top: margen, bottom: margen, left: margen, right: margen, background: TRANSPARENTE });
  // `flatten` sustituye la transparencia por el fondo claro: el favicon necesita
  // fondo sólido para leerse en cualquier pestaña.
  return (aplanar ? base.flatten({ background: fondo }) : base).png().toBuffer();
};

const claro = await cuadrado(MARFIL, true);
const transparente = await cuadrado(TRANSPARENTE, false);
const icono = (buf, px, destino) =>
  sharp(buf).resize(px, px).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(destino);

await icono(claro, 512, `${OUT}/icon.png`);
await icono(claro, 192, `${OUT}/icon-192.png`);
await icono(claro, 180, `${OUT}/apple-icon.png`);
await icono(transparente, 512, `${OUT}/brand/veritum-emblema.png`);

console.log("Listo: logotipo y emblema generados en public/ y public/brand/.");
