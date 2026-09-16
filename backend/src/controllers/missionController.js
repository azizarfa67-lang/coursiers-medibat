// src/controllers/missionController.js
// Création, attribution automatique et suivi des missions.
// L'attribution auto choisit le coursier "disponible" le plus proche du
// point de départ (Haversine), lui envoie une notification push, et
// diffuse l'événement en temps réel via Socket.IO.

const { Mission, Coursier } = require('../models');
const { trouverPlusProche } = require('../utils/geo');
const { envoyerNotification } = require('../utils/pushNotification');

// ---------------------------------------------------------------------
// POST /api/missions — créer une mission (admin) + tenter l'auto-attribution
// ---------------------------------------------------------------------
async function creerMission(req, res, next) {
  try {
    const {
      adresse_depart, latitude_depart, longitude_depart,
      adresse_arrivee, latitude_arrivee, longitude_arrivee,
      description, priorite, auto_assigner = true,
    } = req.body;

    if (!adresse_depart || !latitude_depart || !longitude_depart || !adresse_arrivee) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants.' });
    }

    const mission = await Mission.create({
      adresse_depart, latitude_depart, longitude_depart,
      adresse_arrivee, latitude_arrivee, longitude_arrivee,
      description, priorite: priorite || 'normale',
      statut: 'en_attente',
    });

    let assignation = null;
    if (auto_assigner) {
      assignation = await assignerAuCoursierLePlusProche(mission, req.app.get('io'));
    }

    res.status(201).json({
      success: true,
      message: assignation ? 'Mission créée et assignée automatiquement.' : 'Mission créée, en attente d\'attribution.',
      mission: assignation ? assignation.mission : mission,
      coursierAssigne: assignation ? assignation.coursier : null,
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Logique d'attribution automatique réutilisable
// ---------------------------------------------------------------------
async function assignerAuCoursierLePlusProche(mission, io) {
  const disponibles = await Coursier.findAll({
    where: { statut: 'disponible', actif: true },
  });

  const resultat = trouverPlusProche(
    disponibles,
    Number(mission.latitude_depart),
    Number(mission.longitude_depart)
  );

  if (!resultat) return null; // aucun coursier disponible

  const { coursier } = resultat;

  mission.coursier_id = coursier.id;
  mission.statut = 'assignee';
  mission.assignee_at = new Date();
  await mission.save();

  // Notification push au coursier concerné.
  await envoyerNotification(
    coursier.fcm_token,
    'Nouvelle mission disponible',
    `Départ : ${mission.adresse_depart}`,
    { missionId: mission.id, type: 'nouvelle_mission' }
  );

  // Diffusion temps réel.
  if (io) {
    io.to(`coursier:${coursier.id}`).emit('mission:nouvelle', { mission });
    io.to('admins').emit('mission:assignee', { mission, coursierId: coursier.id });
  }

  return { mission, coursier };
}

// ---------------------------------------------------------------------
// PATCH /api/missions/:id/statut — coursier met à jour l'avancement
// ---------------------------------------------------------------------
async function changerStatutMission(req, res, next) {
  try {
    const { id } = req.params;
    const { statut } = req.body; // en_cours | terminee | annulee

    const mission = await Mission.findByPk(id);
    if (!mission) return res.status(404).json({ success: false, message: 'Mission introuvable.' });

    // Un coursier ne peut modifier que ses propres missions.
    if (req.user.role === 'coursier' && mission.coursier_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Cette mission ne vous est pas assignée.' });
    }

    mission.statut = statut;
    if (statut === 'terminee') mission.terminee_at = new Date();
    await mission.save();

    // Si la mission est terminée, le coursier redevient disponible.
    if (statut === 'terminee' || statut === 'annulee') {
      await Coursier.update({ statut: 'disponible' }, { where: { id: mission.coursier_id } });
    }

    const io = req.app.get('io');
    io.to('admins').emit('mission:statut_change', { missionId: mission.id, statut });

    res.json({ success: true, message: 'Statut de mission mis à jour.', mission });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// GET /api/missions — liste (avec filtres statut / coursier)
// ---------------------------------------------------------------------
async function listerMissions(req, res, next) {
  try {
    const { statut, coursier_id } = req.query;
    const where = {};
    if (statut) where.statut = statut;
    if (coursier_id) where.coursier_id = coursier_id;

    // Un coursier ne voit que ses propres missions.
    if (req.user.role === 'coursier') where.coursier_id = req.user.id;

    const missions = await Mission.findAll({
      where,
      include: [{ model: Coursier, as: 'coursier', attributes: ['id', 'nom', 'prenom'] }],
      order: [['created_at', 'DESC']],
    });

    res.json({ success: true, count: missions.length, missions });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// PATCH /api/missions/:id/assigner — attribution manuelle (admin)
// ---------------------------------------------------------------------
async function assignerManuellement(req, res, next) {
  try {
    const { id } = req.params;
    const { coursier_id } = req.body;

    const mission = await Mission.findByPk(id);
    if (!mission) return res.status(404).json({ success: false, message: 'Mission introuvable.' });

    const coursier = await Coursier.findByPk(coursier_id);
    if (!coursier) return res.status(404).json({ success: false, message: 'Coursier introuvable.' });

    mission.coursier_id = coursier.id;
    mission.statut = 'assignee';
    mission.assignee_at = new Date();
    await mission.save();

    await envoyerNotification(
      coursier.fcm_token,
      'Nouvelle mission assignée',
      `Départ : ${mission.adresse_depart}`,
      { missionId: mission.id, type: 'nouvelle_mission' }
    );

    const io = req.app.get('io');
    io.to(`coursier:${coursier.id}`).emit('mission:nouvelle', { mission });
    io.to('admins').emit('mission:assignee', { mission, coursierId: coursier.id });

    res.json({ success: true, message: 'Mission assignée.', mission });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  creerMission,
  changerStatutMission,
  listerMissions,
  assignerManuellement,
  assignerAuCoursierLePlusProche,
};
