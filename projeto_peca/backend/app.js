require('dotenv').config();
// 🔐 app.js - configurações principais do servidor Express - git ignore
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const passport = require('./auth');
const cors = require('cors');

const config = require('./config');
const { User, Campaign, Piece, sequelize } = require('./models');

// Define as associações entre os modelos
Campaign.hasMany(Piece);
Piece.belongsTo(Campaign);

const app = express();

const corsOptions = {
  origin: 'http://localhost:3001', // Permite que APENAS o frontend faça requisições
  credentials: true, // Essencial para permitir o envio de cookies de sessão
};
app.use(cors(corsOptions));


// Sessão e autenticação via Google
app.use(session({
  secret: process.env.SESSION_SECRET, // USA A VARIÁVEL DO .env
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
const upload = multer({ dest: path.join(__dirname, 'uploads') });

/* ==========
   Autenticação com Google
============= */
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
res.redirect('http://localhost:3001/');
  }
);

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.get('/auth/status', (req, res) => {
  if (req.isAuthenticated()) { // Função mágica do Passport.js
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



/* ==========
   Middleware de Autenticação com JWT
============= */
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

/* ==========
   Cadastro Manual (opcional)
============= */
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const user = await User.create({ username, password, role });
    res.json({ id: user.id, username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ==========
   Login Manual
============= */
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret);
  res.json({ token });
});

/* ==========
   Campanhas
============= */
// Criar nova campanha
app.post('/campaigns', authenticateToken, async (req, res) => {
  const { name, client, creativeLine, startDate, endDate } = req.body;
  try {
    const campaign = await Campaign.create({ name, client, creativeLine, startDate, endDate });
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar campanhas
app.get('/campaigns', authenticateToken, async (req, res) => {
  const campaigns = await Campaign.findAll();
  res.json(campaigns);
});

/* ==========
   Upload de Peças
============= */
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

/* ==========
   Aprovação Pública
============= */
// Página pública de aprovação (via link)
app.get('/approval/:hash', async (req, res) => {
  const campaign = await Campaign.findOne({
    where: { approvalHash: req.params.hash },
    include: Piece
  });
  if (!campaign) return res.status(404).json({ error: 'Invalid link' });
  res.json({ campaign });
});

// Envio de feedbacks
app.post('/approval/:hash', async (req, res) => {
  const { pieces } = req.body; // array de feedbacks
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

/* ==========
   Servir arquivos
============= */
app.get('/files/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  res.sendFile(filePath);
});

/* ==========
   Inicialização
============= */
async function start() {
  await sequelize.sync();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

start();
