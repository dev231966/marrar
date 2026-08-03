import Skeleton from '../../../components/Skeleton';

// Antes: 5 conquistas fixas no código (2 sempre "locked" para sempre).
// Agora: o catálogo real vem de /api/conquistas, que já sabe o que este
// utilizador desbloqueou (nível, sequência, mestria de tema, etc.).
export default function Achievements({ conquistas, carregando }) {
  if (carregando) {
    return (
      <>
        <div className="section-lbl">Conquistas</div>
        <div className="achv-row">
          {[0, 1, 2, 3].map((i) => (
            <div className="achv" key={i}>
              <Skeleton width="58px" height="58px" radius="50%" />
              <Skeleton width="50px" height="10px" style={{ marginTop: 7 }} />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!conquistas || conquistas.length === 0) {
    return null; // sem dados de conquistas: secção some, sem espaço vazio a ocupar layout
  }

  return (
    <>
      <div className="section-lbl">Conquistas</div>
      <div className="achv-row">
        {conquistas.map((c) => (
          <div className={`achv${c.desbloqueada ? '' : ' locked'}`} key={c.chave} title={c.descricao}>
            <div className="achv-badge">
              <span className="achv-emoji">{c.desbloqueada ? c.icone : '🔒'}</span>
            </div>
            <span>{c.nome}</span>
          </div>
        ))}
      </div>
    </>
  );
}
