import { useState } from "react";
import DashboardHeader from "../../components/layout/DashboardHeader";
import Mathmarrar from "../../components/Mathmarrar";
import { formulario, unidadesPorCategoria } from "../../data/ferramentasData";
import "./Ferramentas.css";

const FERRAMENTAS = [
  { id: "calculadora", nome: "Calculadora", descricao: "Operações rápidas sem sair da plataforma.", icon: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" /></> },
  { id: "conversor", nome: "Conversor de Unidades", descricao: "Comprimento, massa e temperatura.", icon: <><path d="M7 16V4M7 4L4 7M7 4l3 3" /><path d="M17 8v12M17 20l3-3M17 20l-3-3" /></> },
  { id: "formulario", nome: "Formulário Rápido", descricao: "As fórmulas mais usadas, por matéria.", icon: <><path d="M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" /><path d="M14 2v6h6M8 13h8M8 17h5" /></> },
];

function Calculadora() {
  const [expr, setExpr] = useState("");

  function apertar(v) {
    if (v === "C") return setExpr("");
    if (v === "⌫") return setExpr((e) => e.slice(0, -1));
    if (v === "=") {
      try {
        // eslint-disable-next-line no-new-func
        const resultado = Function(`"use strict"; return (${expr.replace(/×/g, "*").replace(/÷/g, "/")})`)();
        setExpr(Number.isFinite(resultado) ? String(Number(resultado.toFixed(6))) : "Erro");
      } catch {
        setExpr("Erro");
      }
      return;
    }
    setExpr((e) => (e === "Erro" ? v : e + v));
  }

  const botoes = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "-", "0", ".", "C", "+"];

  return (
    <div className="ferr-tool calc">
      <div className="calc-display">{expr || "0"}</div>
      <div className="calc-grid">
        {botoes.map((b) => (
          <button key={b} className={`calc-btn ${"÷×-+".includes(b) ? "op" : ""} ${b === "C" ? "clear" : ""}`} onClick={() => apertar(b)}>
            {b}
          </button>
        ))}
        <button className="calc-btn eq" onClick={() => apertar("=")}>=</button>
      </div>
    </div>
  );
}

function Conversor() {
  const [categoria, setCategoria] = useState("comprimento");
  const cat = unidadesPorCategoria[categoria];
  const unidadesKeys = cat.especial ? ["C", "F", "K"] : Object.keys(cat.unidades);
  const [de, setDe] = useState(unidadesKeys[0]);
  const [para, setPara] = useState(unidadesKeys[1]);
  const [valor, setValor] = useState("1");

  function trocarCategoria(id) {
    const novaCat = unidadesPorCategoria[id];
    const keys = novaCat.especial ? ["C", "F", "K"] : Object.keys(novaCat.unidades);
    setCategoria(id);
    setDe(keys[0]);
    setPara(keys[1]);
  }

  function converter() {
    const n = parseFloat(valor);
    if (Number.isNaN(n)) return "—";

    if (cat.especial) {
      let celsius;
      if (de === "C") celsius = n;
      else if (de === "F") celsius = (n - 32) * (5 / 9);
      else celsius = n - 273.15;

      let resultado;
      if (para === "C") resultado = celsius;
      else if (para === "F") resultado = celsius * (9 / 5) + 32;
      else resultado = celsius + 273.15;

      return resultado.toFixed(2);
    }

    const emBase = n * cat.unidades[de];
    return (emBase / cat.unidades[para]).toFixed(4).replace(/\.?0+$/, "");
  }

  return (
    <div className="ferr-tool conv">
      <div className="conv-cats">
        {Object.entries(unidadesPorCategoria).map(([id, c]) => (
          <button key={id} className={`conv-cat ${categoria === id ? "active" : ""}`} onClick={() => trocarCategoria(id)}>
            {c.nome}
          </button>
        ))}
      </div>

      <div className="conv-row">
        <input type="number" value={valor} onChange={(e) => setValor(e.target.value)} />
        <select value={de} onChange={(e) => setDe(e.target.value)}>
          {unidadesKeys.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>

      <div className="conv-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
      </div>

      <div className="conv-row">
        <div className="conv-resultado">{converter()}</div>
        <select value={para} onChange={(e) => setPara(e.target.value)}>
          {unidadesKeys.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
    </div>
  );
}

function Formulario() {
  return (
    <div className="ferr-tool formulario">
      {formulario.map((grupo) => (
        <div key={grupo.materia} className="form-grupo">
          <div className="form-grupo-head">
            <span className="dot" style={{ background: grupo.cor }} />
            {grupo.materia}
          </div>
          <div className="form-lista">
            {grupo.formulas.map((f) => (
              <div key={f.nome} className="form-item">
                <span className="nome">{f.nome}</span>
                <Mathmarrar tex={f.tex} display={false} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Ferramentas() {
  const [activa, setActiva] = useState(null);
  const ferramentaActiva = FERRAMENTAS.find((f) => f.id === activa);

  return (
    <div className="ferr-page">
      <DashboardHeader />

      <main className="page">
        {!activa ? (
          <>
            <div className="ferr-intro">
              <h1>Ferramentas</h1>
              <p>Um conjunto de utilitários para te ajudar a estudar mais rápido.</p>
            </div>

            <div className="ferr-grid">
              {FERRAMENTAS.map((f) => (
                <button key={f.id} className="ferr-card" onClick={() => setActiva(f.id)}>
                  <div className="ferr-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                  </div>
                  <span className="nome">{f.nome}</span>
                  <span className="desc">{f.descricao}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button className="ferr-voltar" onClick={() => setActiva(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              {ferramentaActiva.nome}
            </button>

            {activa === "calculadora" && <Calculadora />}
            {activa === "conversor" && <Conversor />}
            {activa === "formulario" && <Formulario />}
          </>
        )}
      </main>
    </div>
  );
}
