// src/controllers/authController.js
// Inscription / connexion des coursiers et des admins, avec mots de passe
// hashés (bcrypt) et émission de tokens JWT (access + refresh).

const bcrypt = require('bcryptjs');
const { Coursier, Admin } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

// ---------------------------------------------------------------------
// Inscription d'un coursier
// ---------------------------------------------------------------------
async function registerCoursier(req, res, next) {
  try {
    const { nom, prenom, telephone, email, mot_de_passe, vehicule } = req.body;

    if (!nom || !prenom || !telephone || !mot_de_passe) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants.' });
    }

    const existant = await Coursier.findOne({ where: { telephone } });
    if (existant) {
      return res.status(409).json({ success: false, message: 'Ce numéro de téléphone est déjà utilisé.' });
    }

    const hash = await bcrypt.hash(mot_de_passe, SALT_ROUNDS);

    const coursier = await Coursier.create({
      nom, prenom, telephone, email,
      mot_de_passe: hash,
      vehicule: vehicule || 'moto',
      statut: 'hors_ligne',
    });

    const payload = { id: coursier.id, role: 'coursier' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(201).json({
      success: true,
      message: 'Coursier inscrit avec succès.',
      accessToken,
      refreshToken,
      coursier: sanitizeCoursier(coursier),
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Connexion d'un coursier
// ---------------------------------------------------------------------
async function loginCoursier(req, res, next) {
  try {
    const { telephone, mot_de_passe } = req.body;

    const coursier = await Coursier.findOne({ where: { telephone } });
    if (!coursier || !coursier.actif) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides ou compte désactivé.' });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, coursier.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }

    const payload = { id: coursier.id, role: 'coursier' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      coursier: sanitizeCoursier(coursier),
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Connexion admin
// ---------------------------------------------------------------------
async function loginAdmin(req, res, next) {
  try {
    const { email, mot_de_passe } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, admin.mot_de_passe);
    if (!motDePasseValide) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }

    const payload = { id: admin.id, role: 'admin' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      admin: { id: admin.id, nom: admin.nom, email: admin.email },
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Rafraîchit un access token à partir d'un refresh token valide
// ---------------------------------------------------------------------
async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token requis.' });
    }

    const decoded = verifyRefreshToken(refreshToken); // lève une erreur si invalide/expiré
    const payload = { id: decoded.id, role: decoded.role };
    const accessToken = generateAccessToken(payload);

    res.json({ success: true, accessToken });
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Refresh token invalide ou expiré.' });
  }
}

// Retire le mot de passe hashé avant de renvoyer l'objet au client.
function sanitizeCoursier(coursier) {
  const obj = coursier.toJSON();
  delete obj.mot_de_passe;
  return obj;
}

module.exports = { registerCoursier, loginCoursier, loginAdmin, refreshToken };
