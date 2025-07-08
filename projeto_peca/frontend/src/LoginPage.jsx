// Em: frontend/src/LoginPage.jsx

import React from 'react';
import aprobiLogo from './assets/aprobi-logo.jpg'; // 

const BACKEND_URL = 'http://localhost:3000';

function LoginPage() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '100px' }}>
      {/* 2. USE A VARIÁVEL IMPORTADA AQUI */}
      <img src={aprobiLogo} alt="Aprobi Logo" style={{ width: '150px', marginBottom: '20px' }} />
      <h1>Bem-vindo ao Aprobi</h1>
      <p>Sistema de Validação de Peças Criativas</p>
      <a 
        href={`${BACKEND_URL}/auth/google`}
        style={{ 
          display: 'inline-block', padding: '15px 30px', fontSize: '18px', 
          fontWeight: 'bold', color: 'white', backgroundColor: '#4285F4', 
          borderRadius: '8px', textDecoration: 'none', marginTop: '20px' 
        }}
      >
        Entrar com Google
      </a>
    </div>
  );
}

export default LoginPage;