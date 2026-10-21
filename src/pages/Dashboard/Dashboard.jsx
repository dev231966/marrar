import { useEffect, useState } from 'react';
import { useAuth, authFetch } from '../../context/AuthContext';
import DashboardHeader from '../../components/layout/DashboardHeader';
import ScoreCard from './sections/ScoreCard';
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

        <div className="hero-row">
          <ScoreCard progresso={progresso} />
          <ContinueCard recomendado={recomendado} carregando={carregando} />
        </div>

        <section className="daily-plan" aria-labelledby="daily-plan-title">
          <div className="daily-plan-heading">
            <div>
              <span className="section-kicker">Roteiro de hoje</span>
              <h2 id="daily-plan-title">Uma sessão curta vale mais do que esperar pela motivação.</h2>
            </div>
            <span className="daily-plan-date">{new Date().toLocaleDateString('pt-MZ', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <div className="daily-plan-grid">
            <article className="plan-step plan-step-primary">
              <span className="plan-step-number">01</span>
              <div>
                <span className="plan-step-label">Reforçar</span>
                <h3>{recomendado?.tema || 'Escolher um tema'}</h3>
                <p>{recomendado ? `A tua taxa está em ${Math.round((recomendado.acertos / recomendado.total) * 100)}%. Faz uma ronda de 5 questões.` : 'Começa por uma disciplina para criar o teu primeiro registo.'}</p>
              </div>
              <a href="/dashboard/exercicios" className="plan-step-action">Praticar</a>
            </article>
            <article className="plan-step">
              <span className="plan-step-number">02</span>
              <div>
                <span className="plan-step-label">Rever</span>
                <h3>Os teus erros recentes</h3>
                <p>{progresso?.errosRecentes ? `${progresso.errosRecentes} pontos para rever no caderno.` : 'Cada erro guardado vira uma pista para a próxima tentativa.'}</p>
              </div>
              <a href="/dashboard/erros" className="plan-step-action secondary">Abrir caderno</a>
            </article>
            <article className="plan-step">
              <span className="plan-step-number">03</span>
              <div>
                <span className="plan-step-label">Consolidar</span>
                <h3>Explicar um conceito</h3>
                <p>Fecha a sessão com uma explicação simples do tema que estudaste.</p>
              </div>
              <a href="/dashboard/explicacao" className="plan-step-action secondary">Estudar</a>
            </article>
          </div>
        </section>

        <div className="section-lbl">As tuas disciplinas</div>
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
