// src/routes/missionRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  creerMission,
  changerStatutMission,
  listerMissions,
  assignerManuellement,
} = require('../controllers/missionController');

router.post('/', authenticate, requireRole('admin'), creerMission);
router.get('/', authenticate, listerMissions); // admin: toutes, coursier: les siennes
router.patch('/:id/statut', authenticate, changerStatutMission);
router.patch('/:id/assigner', authenticate, requireRole('admin'), assignerManuellement);

module.exports = router;
