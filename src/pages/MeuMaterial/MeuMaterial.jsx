import { useRef, useState } from "react";
import DashboardHeader from "../../components/layout/DashboardHeader";
import { pastasIniciais, ficheirosIniciais } from "../../data/materialData";
import "./MeuMaterial.css";

const ICONS = {
  pdf: <path d="M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zM14 2v6h6" />,
  img: <><rect x="4" y="4" width="16" height="16" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="M4 17l5-5 3 3 4-4 4 4" /></>,
  doc: <path d="M6 2h9l5 5v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zM14 2v6h6M8 13h8M8 17h5" />,
};

function iconeTipo(tipo) {
  return ICONS[tipo] || ICONS.doc;
}

export default function MeuMaterial() {
  const [pastaActiva, setPastaActiva] = useState(null);
  const [ficheiros, setFicheiros] = useState(ficheirosIniciais);
  const [arrastando, setArrastando] = useState(false);
  const inputRef = useRef(null);

  const listados = pastaActiva ? ficheiros.filter((f) => f.pastaId === pastaActiva) : ficheiros;

  function adicionarFicheiros(fileList) {
    const novos = Array.from(fileList).map((file, i) => ({
      id: `up-${Date.now()}-${i}`,
      nome: file.name,
      pastaId: pastaActiva || "matematica",
      tipo: file.type.startsWith("image/") ? "img" : file.name.endsWith(".pdf") ? "pdf" : "doc",
      tamanho: `${(file.size / 1024).toFixed(0)} KB`,
      data: "Agora",
    }));
    if (novos.length) setFicheiros((f) => [...novos, ...f]);
  }

  return (
    <div className="mat2-page">
      <DashboardHeader />

      <main className="page">
        <div className="mat2-intro">
          <h1>Meu Material</h1>
          <p>Guarda resumos, fotos de aulas e apontamentos, organizados por matéria.</p>
        </div>

        <div
          className={`mat2-drop ${arrastando ? "over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => { e.preventDefault(); setArrastando(false); adicionarFicheiros(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" multiple hidden onChange={(e) => adicionarFicheiros(e.target.files)} />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
            <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
          </svg>
          <span className="t">Arrasta ficheiros para aqui</span>
          <span className="s">ou clica para escolher do teu dispositivo</span>
        </div>

        <div className="section-lbl">Pastas</div>
        <div className="mat2-pastas">
          <button
            className={`mat2-pasta ${!pastaActiva ? "active" : ""}`}
            onClick={() => setPastaActiva(null)}
          >
            <div className="ic all"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg></div>
            <span className="nome">Tudo</span>
            <span className="qtd">{ficheiros.length}</span>
          </button>
          {pastasIniciais.map((p) => (
            <button
              key={p.id}
              className={`mat2-pasta ${pastaActiva === p.id ? "active" : ""}`}
              onClick={() => setPastaActiva(p.id)}
            >
              <div className="ic" style={{ background: `${p.cor}18`, color: p.cor }}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
              </div>
              <span className="nome">{p.nome}</span>
              <span className="qtd">{ficheiros.filter((f) => f.pastaId === p.id).length}</span>
            </button>
          ))}
        </div>

        <div className="section-lbl">{pastaActiva ? pastasIniciais.find((p) => p.id === pastaActiva)?.nome : "Todos os ficheiros"}</div>
        {listados.length === 0 ? (
          <div className="mat2-vazio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
            <p>Ainda não tens ficheiros aqui.</p>
          </div>
        ) : (
          <div className="mat2-lista">
            {listados.map((f) => {
              const pasta = pastasIniciais.find((p) => p.id === f.pastaId);
              return (
                <div key={f.id} className="mat2-ficheiro">
                  <div className="ic" style={{ background: `${pasta?.cor || "#7C5CBF"}18`, color: pasta?.cor || "#7C5CBF" }}>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{iconeTipo(f.tipo)}</svg>
                  </div>
                  <div className="info">
                    <span className="nome">{f.nome}</span>
                    <span className="meta">{f.tamanho} · {f.data}</span>
                  </div>
                  <button className="mais" aria-label="Mais opções">
                    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
