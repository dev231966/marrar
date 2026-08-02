import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loader from './components/Loader';
import ProtectedRoute from './routes/ProtectedRoute';

const Home = lazy(() => import('./pages/Home/Home'));
const Login = lazy(() => import('./pages/Login/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Explicacao = lazy(() => import('./pages/Explicacao/Explicacao'));
const Materia = lazy(() => import('./pages/Explicacao/Materia'));
const Aula = lazy(() => import('./pages/Explicacao/Aula'));
const Duvidas = lazy(() => import('./pages/Duvidas/Duvidas'));
const Exercicios = lazy(() => import('./pages/Exercicios/Exercicios'));
const Evolucao = lazy(() => import('./pages/Evolucao/Evolucao'));
const Ferramentas = lazy(() => import('./pages/Ferramentas/Ferramentas'));
const CadernoDeErros = lazy(() => import('./pages/CadernoDeErros/CadernoDeErros'));
const MeuMaterial = lazy(() => import('./pages/MeuMaterial/MeuMaterial'));
const Payment = lazy(() => import('./pages/Payment/Payment'));
const Orientacao = lazy(() => import('./pages/Orientacao/Orientacao'));
const Exames = lazy(() => import('./pages/Exames/Exames'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

// Todas as rotas /dashboard/* passam por aqui dentro — uma só chamada a
// ProtectedRoute em vez de repetir em cada <Route>.
function Protegida({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoad) {
    return <Loader progress={85} />;
  }

  return (
    <Suspense fallback={<Loader progress={50} />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Protegida><Dashboard /></Protegida>} />
        <Route path="/dashboard/explicacao" element={<Protegida><Explicacao /></Protegida>} />
        <Route path="/dashboard/explicacao/:materiaId" element={<Protegida><Materia /></Protegida>} />
        <Route path="/dashboard/explicacao/:materiaId/:temaId" element={<Protegida><Aula /></Protegida>} />
        <Route path="/dashboard/duvidas" element={<Protegida><Duvidas /></Protegida>} />
        <Route path="/dashboard/exercicios" element={<Protegida><Exercicios /></Protegida>} />
        <Route path="/dashboard/evolucao" element={<Protegida><Evolucao /></Protegida>} />
        <Route path="/dashboard/ferramentas" element={<Protegida><Ferramentas /></Protegida>} />
        <Route path="/dashboard/erros" element={<Protegida><CadernoDeErros /></Protegida>} />
        <Route path="/dashboard/material" element={<Protegida><MeuMaterial /></Protegida>} />
        <Route path="/dashboard/plano" element={<Protegida><Payment /></Protegida>} />
        <Route path="/dashboard/orientacao" element={<Protegida><Orientacao /></Protegida>} />
        <Route path="/dashboard/exames" element={<Protegida><Exames /></Protegida>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}