// /api/_crypto.js
// Encriptação reversível (AES-256-GCM) para conteúdo que precisa de ser
// mostrado ao utilizador depois — diferente de bcrypt (que é irreversível
// e serve só para senhas). Usa o módulo `crypto` nativo do Node: nada para
// instalar.
//
// Precisa da env var NOTIF_ENC_KEY: uma chave de 32 bytes em hexadecimal
// (64 caracteres). Gera uma com:
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

import crypto from "crypto";

const ALGORITMO = "aes-256-gcm";

function obterChave() {
  const chaveHex = process.env.NOTIF_ENC_KEY;
  if (!chaveHex || chaveHex.length !== 64) {
    throw new Error("NOTIF_ENC_KEY em falta ou inválida (precisa de 64 caracteres hex = 32 bytes).");
  }
  return Buffer.from(chaveHex, "hex");
}

// Encripta um texto simples. Devolve uma string guardável na base de dados
// no formato "iv:tag:conteudo" (tudo em hex).
export function encriptar(textoPlano) {
  const chave = obterChave();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITMO, chave, iv);
  const encriptado = Buffer.concat([cipher.update(textoPlano, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encriptado.toString("hex")}`;
}

// Desencripta o formato acima de volta para o texto original.
export function desencriptar(textoGuardado) {
  const chave = obterChave();
  const [ivHex, tagHex, dadosHex] = String(textoGuardado).split(":");
  if (!ivHex || !tagHex || !dadosHex) throw new Error("Formato encriptado inválido.");

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const dados = Buffer.from(dadosHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITMO, chave, iv);
  decipher.setAuthTag(tag);
  const decriptado = Buffer.concat([decipher.update(dados), decipher.final()]);
  return decriptado.toString("utf8");
}
