import auth from "../src/server/api/auth.js";
import admin from "../src/server/api/admin.js";
import conquistas from "../src/server/api/conquistas.js";
import duvidas from "../src/server/api/duvidas.js";
import exames from "../src/server/api/exames.js";
import exerciciosFeitos from "../src/server/api/exercicios-feitos.js";
import exercicios from "../src/server/api/exercicios.js";
import notificacoes from "../src/server/api/notificacoes.js";
import orientacao from "../src/server/api/orientacao.js";
import perfil from "../src/server/api/perfil/index.js";
import gerarPerfil from "../src/server/api/perfil/gerar.js";
import resumo from "../src/server/api/resumo.js";
import temasSugeridos from "../src/server/api/temas-sugeridos.js";

const routes = {
  "/api/auth": auth,
  "/api/admin": admin,
  "/api/conquistas": conquistas,
  "/api/duvidas": duvidas,
  "/api/exames": exames,
  "/api/exercicios-feitos": exerciciosFeitos,
  "/api/exercicios": exercicios,
  "/api/notificacoes": notificacoes,
  "/api/orientacao": orientacao,
  "/api/perfil": perfil,
  "/api/perfil/gerar": gerarPerfil,
  "/api/resumo": resumo,
  "/api/temas-sugeridos": temasSugeridos,
};

export default async function handler(req, res) {
  const pathname = new URL(req.url, "http://localhost").pathname.replace(/\/$/, "") || "/";
  const route = routes[pathname];

  if (!route) return res.status(404).json({ erro: "Rota API não encontrada." });
  return route(req, res);
}
