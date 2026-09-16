// src/controllers/coursierController.js
// Gère le statut (disponible / occupé / hors ligne), la position GPS,
// et l'enregistrement du token FCM de chaque coursier.
// Toute mise à jour de statut ou de position est diffusée en temps réel
// via Socket.IO à la salle "admins" (tableau de bord) et "coursiers".

const { Coursier, HistoriqueDisponibilite } = require('../models');

const STATUTS_VALIDES = ['disponible', 'occupe', 'hors_ligne'];

// ---------------------------------------------------------------------
// GET /api/coursiers/me — profil du coursier connecté
// ---------------------------------------------------------------------
async function getMonProfil(req, res, next) {
  try {
    const coursier = await Coursier.findByPk(req.user.id, {
      attributes: { exclude: ['mot_de_passe'] },
    });
    if (!coursier) return res.status(404).json({ success: false, message: 'Coursier introuvable.' });
    res.json({ success: true, coursier });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// PATCH /api/coursiers/statut — changer disponible / occupé / hors ligne
// ---------------------------------------------------------------------
async function changerStatut(req, res, next) {
  try {
    const { statut } = req.body;
    if (!STATUTS_VALIDES.includes(statut)) {
      return res.status(400).json({ success: false, message: 'Statut invalide.' });
    }

    const coursier = await Coursier.findByPk(req.user.id);
    if (!coursier) return res.status(404).json({ success: false, message: 'Coursier introuvable.' });

    const statutPrecedent = coursier.statut;
    coursier.statut = statut;
    await coursier.save();

    // Historisation du changement pour audit / statistiques.
    await HistoriqueDisponibilite.create({
      coursier_id: coursier.id,
      statut_precedent: statutPrecedent,
      nouveau_statut: statut,
      latitude: coursier.latitude,
      longitude: coursier.longitude,
    });

    // Diffusion temps réel au dashboard admin.
    const io = req.app.get('io');
    io.to('admins').emit('coursier:statut_change', {
      coursierId: coursier.id,
      statut,
      nom: coursier.nom,
      prenom: coursier.prenom,
      latitude: coursier.latitude,
      longitude: coursier.longitude,
      timestamp: new Date(),
    });

    res.json({ success: true, message: 'Statut mis à jour.', statut });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// PATCH /api/coursiers/position — mise à jour de la position GPS
// (Appelé fréquemment ; en pratique la mise à jour temps réel passe surtout
// par le WebSocket "position:update" — cette route REST sert de fallback
// et persiste la dernière position connue en base.)
// ---------------------------------------------------------------------
async function mettreAJourPosition(req, res, next) {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'latitude et longitude requises.' });
    }

    const coursier = await Coursier.findByPk(req.user.id);
    if (!coursier) return res.status(404).json({ success: false, message: 'Coursier introuvable.' });

    coursier.latitude = latitude;
    coursier.longitude = longitude;
    coursier.derniere_position_maj = new Date();
    await coursier.save();

    const io = req.app.get('io');
    io.to('admins').emit('coursier:position_update', {
      coursierId: coursier.id,
      latitude,
      longitude,
      statut: coursier.statut,
      timestamp: coursier.derniere_position_maj,
    });

    res.json({ success: true, message: 'Position mise à jour.' });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// POST /api/coursiers/fcm-token — enregistrer le token push (FCM)
// ---------------------------------------------------------------------
async function enregistrerFcmToken(req, res, next) {
  try {
    const { fcm_token } = req.body;
    if (!fcm_token) return res.status(400).json({ success: false, message: 'fcm_token requis.' });

    await Coursier.update({ fcm_token }, { where: { id: req.user.id } });
    res.json({ success: true, message: 'Token de notification enregistré.' });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// GET /api/coursiers/disponibles — liste des coursiers disponibles
// (utilisé pour afficher les marqueurs sur la carte)
// ---------------------------------------------------------------------
async function listerDisponibles(req, res, next) {
  try {
    const coursiers = await Coursier.findAll({
      where: { statut: 'disponible', actif: true },
      attributes: ['id', 'nom', 'prenom', 'vehicule', 'latitude', 'longitude', 'derniere_position_maj'],
    });
    res.json({ success: true, count: coursiers.length, coursiers });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// GET /api/coursiers — liste complète (réservé admin) avec filtres
// ---------------------------------------------------------------------
async function listerTous(req, res, next) {
  try {
    const { statut } = req.query;
    const where = {};
    if (statut && STATUTS_VALIDES.includes(statut)) where.statut = statut;

    const coursiers = await Coursier.findAll({
      where,
      attributes: { exclude: ['mot_de_passe'] },
      order: [['nom', 'ASC']],
    });
    res.json({ success: true, count: coursiers.length, coursiers });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMonProfil,
  changerStatut,
  mettreAJourPosition,
  enregistrerFcmToken,
  listerDisponibles,
  listerTous,
};
