import { useEffect, useState } from 'react';
import { useAuth, authFetch } from '../../context/AuthContext';
import DashboardHeader from '../../components/layout/DashboardHeader';
import ContinueCard from './sections/ContinueCard';
import SubjectsRow from './sections/SubjectsRow';
import ActivityFeed from './sections/ActivityFeed';
import Achievements from './sections/Achievements';
import Skeleton from '../../components/Skeleton';
import '../../components/Skeleton.css';
import './Dashboard.css';

export default function Dashboard() {
  const { user, token } = useAuth();
  const studentName = user?.nome?.split(' ')[0] || 'Estudante';

  const [progresso, setProgresso] = useState(null);
  const [recomendado, setRecomendado] = useState(null);
  const [materias, setMaterias] = useState(null);
  const [conquistas, setConquistas] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelado = false;

    async function carregar() {
      setCarregando(true);
      setErro(false);
      try {
        const [rProg, rRec, rMat, rConq] = await Promise.all([
          authFetch(token, '/api/resumo?tipo=progresso&limite=4'),
          authFetch(token, '/api/resumo?tipo=recomendado'),
          authFetch(token, '/api/exercicios-feitos?limite=4'),
          authFetch(token, '/api/conquistas'),
        ]);
        const [dProg, dRec, dMat, dConq] = await Promise.all([
          rProg.json().catch(() => null),
          rRec.json().catch(() => null),
          rMat.json().catch(() => null),
          rConq.json().catch(() => null),
        ]);

        if (cancelado) return;
        if (rProg.ok) setProgresso(dProg);
        if (rRec.ok) setRecomendado(dRec?.recomendado ?? null);
        if (rMat.ok) setMaterias(dMat?.exercicios ?? []);
        if (rConq.ok) setConquistas(dConq?.conquistas ?? []);
      } catch {
        if (!cancelado) setErro(true);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    carregar();
    return () => { cancelado = true; };
  }, [token, tentativa]);

  return (
    <div className="dashboard-page">
      <DashboardHeader />

      <main className="page">
        {erro && (
          <div className="dashboard-alert" role="alert">
            <div>
              <strong>Não foi possível actualizar o teu progresso.</strong>
              <span>Os teus dados continuam seguros. Tenta novamente.</span>
            </div>
            <button type="button" onClick={() => setTentativa((valor) => valor + 1)}>
              Tentar novamente
            </button>
          </div>
        )}

        <div className="greet">
          <div>
            <h1>
              Olá, <span>{studentName}</span>
            </h1>
            <p>Aqui está o teu progresso de hoje</p>
          </div>
          <div className="streak">
            <svg viewBox="0 0 24 24">
              <path d="M12 2c1 3-2 4-2 7a4 4 0 008 0c0-1-.5-2-1-2 1 3-1 5-3 5a4 4 0 01-4-4c0-4 3-4 2-6z" />
            </svg>
            {carregando ? (
              <Skeleton width="70px" height="14px" />
            ) : (
              `${progresso?.sequenciaDias ?? 0} dias seguidos`
            )}
          </div>
        </div>

        <section className="dashboard-actions" aria-labelledby="actions-title">
          <div className="dashboard-section-heading">
            <div>
              <span className="section-kicker">Área de estudo</span>
              <h2 id="actions-title">O que queres fazer agora?</h2>
            </div>
            <span className="dashboard-date">{new Date().toLocaleDateString('pt-MZ', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <div className="dashboard-action-grid">
            <a href="/dashboard/exercicios" className="dashboard-action dashboard-action-primary">
              <span className="action-icon">01</span><span><strong>Praticar exercícios</strong><small>{recomendado?.tema || 'Escolhe uma disciplina e começa'}</small></span><b>→</b>
            </a>
            <a href="/dashboard/exercicios?modo=simulado" className="dashboard-action">
              <span className="action-icon">02</span><span><strong>Preparar um simulado</strong><small>Escolhe duração, disciplina e nível</small></span><b>→</b>
            </a>
            <a href="/dashboard/erros" className="dashboard-action">
              <span className="action-icon">03</span><span><strong>Rever os teus erros</strong><small>{progresso?.errosRecentes ? `${progresso.errosRecentes} itens para rever` : 'Constrói o teu caderno enquanto praticas'}</small></span><b>→</b>
            </a>
          </div>
        </section>

        <section className="study-metrics" aria-label="Medidas concretas do teu estudo">
          <article><strong>{progresso?.exerciciosFeitos ?? 0}</strong><span>exercícios feitos</span></article>
          <article><strong>{progresso?.exerciciosCertos ?? 0}</strong><span>respostas certas</span></article>
          <article><strong>{progresso?.sequenciaDias ?? 0}</strong><span>dias seguidos</span></article>
          <article><strong>{progresso?.errosRecentes ?? 0}</strong><span>itens para rever</span></article>
        </section>

        <SubjectsRow materias={materias} carregando={carregando} />
        <div className="section-lbl">O teu histórico</div>
        <div className="grid-2">
          <ActivityFeed atividade={progresso?.atividade} />
        </div>

        <Achievements conquistas={conquistas} carregando={carregando} />
      </main>
    </div>
  );
}
