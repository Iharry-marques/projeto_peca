# Projeto Peça - Sistema de Aprovação de Peças Publicitárias

## 📋 Visão Geral
Este é um sistema fullstack completo para aprovação e gerenciamento de peças publicitárias, desenvolvido para agências de publicidade e equipes criativas. O sistema permite que colaboradores façam upload de materiais criativos e clientes/supervisores aprovem ou solicitem ajustes nas peças.

## 🏗️ Arquitetura do Sistema

### Backend (Node.js + Express)
- **Framework**: Express.js
- **Banco de Dados**: SQLite com Sequelize ORM
- **Autenticação**: OAuth 2.0 (Google) + JWT + Sessions
- **Upload**: Multer para gerenciamento de arquivos
- **Segurança**: bcrypt, CORS, express-session

### Frontend (React + Vite)
- **Framework**: React 19 com Vite
- **Roteamento**: React Router DOM
- **Estilização**: TailwindCSS
- **Ícones**: Lucide React
- **UI/UX**: Interface moderna com drag-and-drop

## 📊 Modelos de Dados

### User (Usuário)
```javascript
{
  id: Integer (PK),
  username: String (email, único),
  password: String (criptografado),
  role: String ('admin' | 'collaborator')
}
```

### Campaign (Campanha)
```javascript
{
  id: Integer (PK),
  name: String (nome da campanha),
  client: String (cliente),
  creativeLine: String (linha criativa),
  startDate: Date,
  endDate: Date,
  approvalHash: String (link público único)
}
```

### Piece (Peça)
```javascript
{
  id: Integer (PK),
  filename: String (nome do arquivo),
  mimetype: String (tipo do arquivo),
  status: String ('pending' | 'approved' | 'needs_adjustment' | 'rejected'),
  comment: Text (comentários de aprovação),
  CampaignId: Integer (FK para Campaign)
}
```

## 🚀 Funcionalidades Principais

### 1. **Sistema de Autenticação**
- Login via Google OAuth 2.0
- Sessões persistentes no banco de dados
- Controle de acesso por roles (admin/collaborator)
- Redirecionamento automático após login

### 2. **Gerenciamento de Campanhas**
- Criação de campanhas com cliente e linha criativa
- Listagem de campanhas por data (mais recentes primeiro)
- Hash único para aprovação pública externa
- Modal intuitivo para criar novas campanhas

### 3. **Upload e Gerenciamento de Peças**
- **Drag & Drop**: Interface moderna para arrastar arquivos
- **Suporte a múltiplos formatos**: Imagens, vídeos, PDFs
- **Upload múltiplo**: Vários arquivos simultaneamente
- **Preview automático**: Visualização prévia dos arquivos

### 4. **Sistema de Aprovação**
- **4 Status de validação**:
  - 🟡 **Pending**: Aguardando aprovação
  - 🟢 **Approved**: Aprovado
  - 🟠 **Needs Adjustment**: Precisa ajustes
  - 🔴 **Rejected**: Reprovado
- **Comentários**: Feedback detalhado em cada peça
- **Modal de validação**: Interface limpa para aprovar/reprovar

### 5. **Visualização e Filtros**
- **Filtros por status**: Organização eficiente das peças
- **Contador de peças**: Estatísticas em tempo real
- **Preview responsivo**: Diferentes tipos de arquivo
- **Interface hover**: Interações visuais elegantes

### 6. **Aprovação Pública**
- **Link público único**: Clientes aprovam sem login
- **Hash de segurança**: Acesso controlado por URL
- **Interface dedicada**: Visualização externa limpa

### 7. **Exportação de Dados**
- **Export CSV**: Relatórios tabulares
- **Export PDF**: Documentos formatados
- **Dados estruturados**: Informações completas das campanhas

## 🎨 Interface do Usuário

### Design System
- **Cores principais**: 
  - Amarelo Aprobi: `#ffc801`
  - Gradientes modernos
  - Palette de status colorida
- **Tipografia**: Sistema hierárquico claro
- **Espaçamento**: Grid system consistente
- **Sombras**: Elevação visual elegante

### Componentes Principais
1. **FileUpload**: Zona de drag & drop
2. **FileViewer**: Cards de preview
3. **FilePopup**: Modal de validação
4. **ValidationFilters**: Sistema de filtros
5. **NewCampaignModal**: Criação de campanhas
6. **Spinner**: Loading states

## 🔧 Configuração Técnica

### Variáveis de Ambiente (.env)
```bash
# Backend
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PORT=3000

# Frontend
VITE_BACKEND_URL=http://localhost:3000
```

### Scripts Disponíveis
```bash
# Backend
npm run start    # Produção
npm run dev      # Desenvolvimento com nodemon

# Frontend
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build
```

## 📁 Estrutura de Pastas
```
projeto_peca/
├── backend/
│   ├── models/          # Modelos Sequelize
│   ├── routes/          # Rotas da API
│   ├── middleware/      # Middlewares customizados
│   ├── uploads/         # Arquivos enviados
│   ├── auth.js          # Configuração Passport
│   ├── config.js        # Configurações do banco
│   └── app.js           # Aplicação principal
├── frontend/
│   ├── src/
│   │   ├── assets/      # Imagens e recursos
│   │   ├── App.jsx      # Componente principal
│   │   ├── HomePage.jsx # Página principal (856 linhas!)
│   │   ├── LoginPage.jsx# Página de login
│   │   └── main.jsx     # Entry point
│   └── public/          # Arquivos estáticos
└── .vite/               # Cache do Vite
```

## 🛡️ Segurança Implementada

### Autenticação e Autorização
- OAuth 2.0 com Google
- Sessions criptografadas
- Middleware de autenticação em rotas protegidas
- Senhas criptografadas com bcrypt

### Proteção de Dados
- CORS configurado adequadamente
- Sanitização de inputs
- Proteção contra upload malicioso
- Sessions com cookies seguros

## 🚀 Melhorias Sugeridas

### 1. **Funcionalidades Avançadas**
- [ ] Sistema de notificações (email/push)
- [ ] Histórico de versões das peças
- [ ] Aprovação em lote
- [ ] Tags e categorização
- [ ] Sistema de templates
- [ ] Calendário de campanhas
- [ ] Dashboard analytics

### 2. **Performance e Otimização**
- [ ] Lazy loading para arquivos grandes
- [ ] Compressão de imagens automática
- [ ] Cache de thumbnails
- [ ] Paginação das listas
- [ ] PWA (Progressive Web App)

### 3. **Experiência do Usuário**
- [ ] Tutorial interativo
- [ ] Atalhos de teclado
- [ ] Modo escuro
- [ ] Responsividade mobile aprimorada
- [ ] Feedback visual melhorado

### 4. **Funcionalidades Administrativas**
- [ ] Logs de auditoria
- [ ] Backup automático
- [ ] Métricas de uso
- [ ] Gerenciamento de usuários
- [ ] Configurações avançadas

### 5. **Integrações**
- [ ] API para integrações externas
- [ ] Webhook para notificações
- [ ] Slack/Teams integration
- [ ] Google Drive sync
- [ ] Adobe Creative Cloud

## 🏃 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Google OAuth credentials

### Instalação
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (nova aba)
cd frontend
npm install
npm run dev
```

### Configuração OAuth
1. Criar projeto no [Google Console](https://console.developers.google.com)
2. Configurar OAuth 2.0 credentials
3. Adicionar URLs de callback
4. Configurar variáveis de ambiente

## 📈 Status do Projeto

### ✅ Implementado
- Sistema completo de autenticação
- CRUD de campanhas e peças
- Sistema de aprovação funcional
- Interface moderna e responsiva
- Upload de arquivos robusto
- Exportação de dados

### 🔄 Em Desenvolvimento
- Melhorias de performance
- Testes automatizados
- Documentação da API

### 📋 Roadmap
- Sistema de notificações
- Mobile app
- Integrações externas
- Analytics avançado

## 💡 Conclusão

Este é um sistema **muito bem estruturado** e **funcionalmente completo** para aprovação de peças publicitárias. O código demonstra boas práticas de desenvolvimento, arquitetura limpa e experiência do usuário cuidadosamente pensada.

**Pontos Fortes:**
- Arquitetura moderna e escalável
- Interface intuitiva e profissional
- Sistema de segurança robusto
- Código bem organizado e documentado
- Funcionalidades completas para o negócio

**Recomendações Imediatas:**
1. Implementar testes automatizados
2. Adicionar monitoramento e logs
3. Configurar deploy automatizado
4. Documentar API endpoints
5. Otimizar performance para arquivos grandes

O projeto está **pronto para produção** com algumas melhorias de infraestrutura!