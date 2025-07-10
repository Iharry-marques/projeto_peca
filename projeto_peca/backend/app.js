require('dotenv').config(); // MUITO IMPORTANTE: Deve ser a primeira linha

// --- Importações de Pacotes ---
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./auth');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SQLiteStore = require('connect-sqlite3')(session); // Importa o armazenamento da sessão

// --- Importações do Projeto ---
const config = require('./config');
const { User, Campaign, Piece, sequelize } = require('./models');

// --- Início da Aplicação Express ---
const app = express();
app.set('trust proxy', 1); // Importante para o Render e cookies seguros

// --- Configuração dos Middlewares (A Ordem é Importante) ---

// 1. CORS: Deve vir primeiro para permitir a comunicação.
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};
app.use(cors(corsOptions));

// 2. Sessões: Agora salvas no banco de dados para serem persistentes.
app.use(
  session({
    store: new SQLiteStore({
      db: 'database.sqlite', // Nome do arquivo do banco de dados
      dir: './',             // Salva o banco na raiz do backend
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      proxy: true,
      sameSite: 'none',
      domain: '.onrender.com',
    },
  })
);

// 3. Passport.js: Deve vir depois da configuração da sessão.
app.use(passport.initialize());
app.use(passport.session());

// 4. Outros Middlewares
app.use(bodyParser.json());
const upload = multer({ dest: path.join(__dirname, 'uploads') });


// --- Associações dos Modelos ---
Campaign.hasMany(Piece);
Piece.belongsTo(Campaign);


// --- Rotas da Aplicação ---

/* ========== Autenticação com Google ========== */

// Rota que inicia o processo de login
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Rota para a qual o Google redireciona após o usuário fazer o login
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL + '/login' }),
  (req, res) => {
    // LOG 1: Vamos ver se a sessão está sendo criada corretamente
    console.log('[CALLBACK] Login bem-sucedido. Usuário na sessão:', req.user);
    console.log('[CALLBACK] ID da Sessão:', req.sessionID);
    
    // Se a autenticação for um sucesso, redireciona para a página principal do frontend
    res.redirect(process.env.FRONTEND_URL);
  }
);

// Rota para verificar se o usuário está logado
app.get('/auth/status', (req, res) => {
  // LOG 2: Vamos ver o que o backend recebe na verificação
  console.log('---------------------------------');
  console.log('[STATUS] Recebida verificação de status.');
  console.log('[STATUS] O ID da sessão recebida é:', req.sessionID);
  console.log('[STATUS] O usuário na sessão é:', req.user);
  console.log('[STATUS] O resultado de req.isAuthenticated() é:', req.isAuthenticated());
  console.log('---------------------------------');

  if (req.isAuthenticated()) {
    res.status(200).json({
      isAuthenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
      },
    });
  } else {
    res.status(401).json({
      isAuthenticated: false,
      user: null,
    });
  }
});

// Rota para fazer logout
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect(process.env.FRONTEND_URL);
  });
});


/* ========== Outras Rotas da Aplicação ========== */

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await User.create({ username, password, role });
    res.json({ id: user.id, username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret);
  res.json({ token });
});

app.post('/campaigns', authenticateToken, async (req, res) => {
  const { name, client, creativeLine, startDate, endDate } = req.body;
  try {
    const campaign = await Campaign.create({ name, client, creativeLine, startDate, endDate });
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/campaigns', authenticateToken, async (req, res) => {
  const campaigns = await Campaign.findAll();
  res.json(campaigns);
});

app.post('/campaigns/:id/upload', authenticateToken, upload.array('files'), async (req, res) => {
  const campaign = await Campaign.findByPk(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  const pieces = await Promise.all(req.files.map(f => Piece.create({
    filename: f.filename,
    mimetype: f.mimetype,
    CampaignId: campaign.id,
  })));
  res.json(pieces);
});

app.get('/approval/:hash', async (req, res) => {
  const campaign = await Campaign.findOne({
    where: { approvalHash: req.params.hash },
    include: Piece
  });
  if (!campaign) return res.status(404).json({ error: 'Invalid link' });
  res.json({ campaign });
});

app.post('/approval/:hash', async (req, res) => {
  const { pieces } = req.body;
  const campaign = await Campaign.findOne({
    where: { approvalHash: req.params.hash },
    include: Piece
  });
  if (!campaign) return res.status(404).json({ error: 'Invalid link' });

  for (const p of pieces) {
    const piece = await Piece.findOne({ where: { id: p.id, CampaignId: campaign.id } });
    if (piece) {
      piece.status = p.status;
      piece.comment = p.comment;
      await piece.save();
    }
  }

  res.json({ message: 'Feedback recorded' });
});

app.get('/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  res.sendFile(filePath);
});


/* ========== Inicialização do Servidor ========== */

async function start() {
  try {
    await sequelize.sync();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`[SUCESSO] Servidor rodando na porta ${port}`);
    });
  } catch (error) {
    console.error('[ERRO] Não foi possível iniciar o servidor:', error);
  }
}

start();