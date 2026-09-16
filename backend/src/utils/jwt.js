// src/utils/jwt.js
// Génération et vérification des tokens JWT (access + refresh).

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Génère un access token de courte durée.
 * @param {object} payload - ex: { id, role: 'coursier' | 'admin' }
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Génère un refresh token de longue durée, utilisé pour renouveler
 * l'access token sans redemander les identifiants.
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
