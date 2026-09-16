// src/server.js
// Point d'entrée : démarre Express (API REST), Socket.IO (temps réel) et
// la connexion MySQL, le tout sur le même serveur HTTP.

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const { sequelize, testConnection } = require('./config/db');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { registerSocketHandlers } = require('./sockets/socketHandler');

const authRoutes = require('./routes/authRoutes');
const coursierRoutes = require('./routes/coursierRoutes');
const missionRoutes = require('./routes/missionRoutes');

const app = express();
const server = http.createServer(app);

// --- CORS : autorise le dashboard admin (React) à appeler l'API ---
const corsOrigins = (process.env.CORS_ORIGINS || '*').split(',');
app.use(cors({ origin: corsOrigins }));
app.use(express.json());

// --- Socket.IO, attaché au même serveur HTTP ---
const io = new Server(server, {
  cors: { origin: corsOrigins },
});
app.set('io', io); // permet d'accéder à `io` depuis les contrôleurs REST (req.app.get('io'))
registerSocketHandlers(io);

// --- Routes REST ---
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use('/api/auth', authRoutes);
app.use('/api/coursiers', coursierRoutes);
app.use('/api/missions', missionRoutes);

// --- Gestion des erreurs ---
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await testConnection();
  // En développement, synchronise les modèles avec la DB (alter: true met
  // à jour les tables existantes sans les supprimer). En production,
  // préférer des migrations (Sequelize CLI) au lieu de sync().
  if (process.env.NODE_ENV !== 'production') {
    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés avec la base de données.');
  }

  server.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`🔌 WebSocket (Socket.IO) prêt sur le même port.`);
  });
}

start();

module.exports = { app, server, io };
