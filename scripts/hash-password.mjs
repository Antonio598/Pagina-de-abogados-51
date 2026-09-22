// Genera el valor de PANEL_PASSWORD_HASH.
// Uso:  node scripts/hash-password.mjs "mi contraseña segura"
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
const password = process.argv[2];

if (!password) {
  console.error('Uso: node scripts/hash-password.mjs "tu contraseña"');
  process.exit(1);
}
if (password.length < 12) {
  console.error("Usa al menos 12 caracteres.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = await derive(password.normalize("NFKC"), salt, 64);
console.log(`PANEL_PASSWORD_HASH=${salt.toString("hex")}:${hash.toString("hex")}`);
