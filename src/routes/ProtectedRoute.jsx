import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

// Todo o /dashboard/* passa por aqui. Sem sessão válida -> /login,
// guardando a rota que a pessoa queria para a devolver lá depois de entrar.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader progress={70} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  }

  return children;
}
