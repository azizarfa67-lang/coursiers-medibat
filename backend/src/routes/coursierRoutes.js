// src/routes/coursierRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getMonProfil,
  changerStatut,
  mettreAJourPosition,
  enregistrerFcmToken,
  listerDisponibles,
  listerTous,
} = require('../controllers/coursierController');

// Routes coursier (nécessitent d'être connecté en tant que coursier)
router.get('/me', authenticate, requireRole('coursier'), getMonProfil);
router.patch('/statut', authenticate, requireRole('coursier'), changerStatut);
router.patch('/position', authenticate, requireRole('coursier'), mettreAJourPosition);
router.post('/fcm-token', authenticate, requireRole('coursier'), enregistrerFcmToken);

// Routes publiques/admin
router.get('/disponibles', authenticate, listerDisponibles); // carte interactive
router.get('/', authenticate, requireRole('admin'), listerTous); // dashboard admin

module.exports = router;
