import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Loader from './components/Loader';

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
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/explicacao" element={<Explicacao />} />
        <Route path="/dashboard/explicacao/:materiaId" element={<Materia />} />
        <Route path="/dashboard/explicacao/:materiaId/:temaId" element={<Aula />} />
        <Route path="/dashboard/duvidas" element={<Duvidas />} />
        <Route path="/dashboard/exercicios" element={<Exercicios />} />
        <Route path="/dashboard/evolucao" element={<Evolucao />} />
        <Route path="/dashboard/ferramentas" element={<Ferramentas />} />
        <Route path="/dashboard/erros" element={<CadernoDeErros />} />
        <Route path="/dashboard/material" element={<MeuMaterial />} />
        <Route path="/dashboard/plano" element={<Payment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}