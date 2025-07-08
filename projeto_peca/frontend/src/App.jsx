// Em: frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import './App.css';

/**
 * Este é um componente especial que "protege" uma rota.
 * Ele verifica se o usuário está logado antes de mostrar o conteúdo.
 */
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = não sabemos ainda

  useEffect(() => {
    // Função que pergunta ao backend se estamos logados
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/auth/status', {
          credentials: 'include', // IMPORTANTE: Envia os cookies da sessão para o backend
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []); // O array vazio [] faz isso rodar apenas uma vez, quando o componente carrega

  // Enquanto não sabemos o status, mostramos uma tela de "Carregando..."
  if (isAuthenticated === null) {
    return <div>Carregando...</div>;
  }

  // Se `isAuthenticated` for false, redireciona o usuário para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se chegou até aqui, o usuário está autenticado. Mostra a página protegida (HomePage).
  return children;
}

/**
 * Nosso App agora usa o ProtectedRoute para controlar o acesso à HomePage.
 */
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;