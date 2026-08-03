import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardHeader from "../../components/layout/DashboardHeader";
import { BLOCOS, MATERIAS_EXAME } from "../../data/perfilEstudoData";
import "./PerfilEstudo.css";

const CORES_PRIORIDADE = { alta: "#D6342C", media: "#F0A438", baixa: "#1E9E5A" };

function Pergunta({ pergunta, valor, onChange, formData }) {
  const opcoes = pergunta.opcoesDinamicas ? pergunta.opcoesDinamicas(formData) : pergunta.opcoes;

  if (pergunta.tipo === "text") {
    return <input className="peb-input" value={valor || ""} onChange={(e) => onChange(e.target.value)} />;
  }
  if (pergunta.tipo === "number") {
    return <input className="peb-input" type="number" min="0" max="20" value={valor || ""} onChange={(e) => onChange(e.target.value)} />;
  }
  if (pergunta.tipo === "multiselect") {
    const seleccionados = valor || [];
    return (
      <div className="peb-opcoes">
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            className={`peb-opcao ${seleccionados.includes(o.valor) ? "activa" : ""}`}
            onClick={() => onChange(
              seleccionados.includes(o.valor)
                ? seleccionados.filter((v) => v !== o.valor)
                : [...seleccionados, o.valor]
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="peb-opcoes">
      {opcoes.map((o) => (
        <button
          key={o.valor}
          type="button"
          className={`peb-opcao ${valor === o.valor ? "activa" : ""}`}
          onClick={() => onChange(o.valor)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Wizard({ onSubmit }) {
  const [blocoIdx, setBlocoIdx] = useState(0);
  const [formData, setFormData] = useState({});
  const bloco = BLOCOS[blocoIdx];
  const perguntasVisiveis = bloco.perguntas.filter((p) => !p.condicional || p.condicional(formData));

  function setCampo(id, val) {
    setFormData((f) => ({ ...f, [id]: val }));
  }

  function nivelPorMateriaCompleto() {
    const materias = formData.materiasExame || [];
    if (materias.length === 0) return true;
    const nivel = formData.nivelPorMateria || {};
    return materias.every((m) => nivel[m]);
  }

  function podeAvancar() {
    const respondidas = perguntasVisiveis.every((p) => {
      const v = formData[p.id];
      return p.tipo === "multiselect" ? (v && v.length > 0) : Boolean(v);
    });
    const precisaNivel = perguntasVisiveis.some((p) => p.id === "materiaDificil");
    return respondidas && (!precisaNivel || nivelPorMateriaCompleto());
  }

  function avancar() {
    if (blocoIdx < BLOCOS.length - 1) setBlocoIdx((i) => i + 1);
    else onSubmit(formData);
  }

  return (
    <div className="peb-wizard">
      <div className="peb-progresso">
        {BLOCOS.map((_, i) => <span key={i} className={i <= blocoIdx ? "on" : ""} />)}
      </div>
      <h2>{bloco.titulo}</h2>

      {perguntasVisiveis.map((p) => (
        <div className="peb-pergunta" key={p.id}>
          <label>{p.label}</label>
          <Pergunta pergunta={p} valor={formData[p.id]} formData={formData} onChange={(v) => setCampo(p.id, v)} />

          {p.id === "materiasExame" && (formData.materiasExame || []).length > 0 && (
            <div className="peb-nivel-grupo">
              <span className="peb-nivel-lbl">Como avalias o teu nível em cada uma?</span>
              {formData.materiasExame.map((mId) => {
                const nome = MATERIAS_EXAME.find((m) => m.id === mId)?.nome || mId;
                const nivel = (formData.nivelPorMateria || {})[mId];
                return (
                  <div className="peb-nivel-linha" key={mId}>
                    <span>{nome}</span>
                    <div className="peb-opcoes">
                      {[{ valor: "fraco", label: "Fraco" }, { valor: "medio", label: "Médio" }, { valor: "bom", label: "Bom" }].map((o) => (
                        <button
                          key={o.valor}
                          type="button"
                          className={`peb-opcao pequena ${nivel === o.valor ? "activa" : ""}`}
                          onClick={() => setCampo("nivelPorMateria", { ...(formData.nivelPorMateria || {}), [mId]: o.valor })}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      <div className="peb-nav">
        {blocoIdx > 0 && <button className="peb-btn secundario" onClick={() => setBlocoIdx((i) => i - 1)}>Voltar</button>}
        <button className="peb-btn primario" disabled={!podeAvancar()} onClick={avancar}>
          {blocoIdx < BLOCOS.length - 1 ? "Próximo" : "Concluir"}
        </button>
      </div>
    </div>
  );
}

function Plano({ plano }) {
  return (
    <div className="peb-plano">
      {plano.resumo && <p className="peb-resumo">{plano.resumo}</p>}

      {plano.temas?.length > 0 && (
        <>
          <div className="section-lbl">Temas prioritários</div>
          <div className="peb-tabela">
            {plano.temas.map((t, i) => (
              <div className="peb-tema-linha" key={i}>
                <span className="peb-prioridade" style={{ background: CORES_PRIORIDADE[t.prioridade] || "#999" }} />
                <div>
                  <div className="t">{t.tema}</div>
                  <div className="s">{t.materiaId} · {t.porque}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {plano.instrucoes?.length > 0 && (
        <>
          <div className="section-lbl">Como estudar na Marrar</div>
          <ol className="peb-instrucoes">
            {plano.instrucoes.map((instr, i) => <li key={i}>{instr}</li>)}
          </ol>
        </>
      )}
    </div>
  );
}

export default function PerfilEstudo() {
  const { token } = useAuth();
  const [resultado, setResultado] = useState(undefined); // undefined = a carregar
  const pollRef = useRef(null);

  async function carregar() {
    try {
      const r = await fetch("/api/perfil", { headers: { Authorization: `Bearer ${token}` } });
      const dados = await r.json();
      setResultado(dados.resultado || null);
    } catch {
      setResultado(null);
    }
  }

  useEffect(() => {
    carregar();
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resultado?.estado === "a_processar") {
      pollRef.current = setInterval(carregar, 6000);
      return () => clearInterval(pollRef.current);
    }
    clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultado?.estado]);

  async function submeter(respostas) {
    setResultado({ estado: "a_processar" });
    await fetch("/api/perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ respostas }),
    });
    carregar();
  }

  return (
    <div className="peb-page">
      <DashboardHeader />
      <main className="page">
        <h1>O teu plano de estudo</h1>

        {resultado === undefined && <p className="peb-aviso">A carregar...</p>}

        {resultado === null && <Wizard onSubmit={submeter} />}

        {resultado?.estado === "a_processar" && (
          <div className="peb-aviso">
            O teu plano está a ser preparado. Vamos notificar-te quando estiver pronto — podes sair desta página à vontade.
          </div>
        )}

        {resultado?.estado === "falhou" && (
          <div className="peb-aviso erro">
            Não conseguimos gerar o teu plano. <button className="peb-btn primario" onClick={() => setResultado(null)}>Tentar novamente</button>
          </div>
        )}

        {resultado?.estado === "pronto" && resultado.planoJson && <Plano plano={resultado.planoJson} />}
      </main>
    </div>
  );
}
