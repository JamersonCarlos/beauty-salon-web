import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { MenuLateral } from './components/MenuLateral';
import { useAuth } from './context/AuthContext';
import type { JSX } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Servicos } from './pages/Servicos';
import { Produtos } from './pages/Produtos/Produtos';
import { Vendas } from './pages/Vendas';
import { Auditoria } from './pages/Auditoria';
import { Agendamentos } from './pages/Agendamentos';
import { AgendaFormPage } from './pages/AgendaFormPage';

// Componente para proteger rotas
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Carregando...</div>; // Ou um spinner bonito
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Rotas Protegidas dentro do Layout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MenuLateral />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="vendas" element={<Vendas />} />
        <Route path="servicos" element={<Servicos />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="auditoria" element={<Auditoria />} />
        <Route path="agendamentos" element={<Agendamentos />} />
        <Route path="agendamentos/novo" element={<AgendaFormPage />} />
        <Route path="agendamentos/:id/editar" element={<AgendaFormPage />} />
        <Route path="config" element={<h1>Configurações</h1>} />
      </Route>
    </Routes>
  );
}
