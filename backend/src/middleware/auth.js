// src/middleware/auth.js
// Vérifie le token JWT présent dans l'en-tête Authorization et attache
// l'utilisateur (coursier ou admin) authentifié à req.user.

const { verifyAccessToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token manquant. Accès refusé.' });
  }

  try {
    const decoded = verifyAccessToken(token); // { id, role, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Token invalide ou expiré.' });
  }
}

/**
 * Restreint l'accès à une route à un ou plusieurs rôles.
 * Usage: requireRole('admin') ou requireRole('admin', 'coursier')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé : privilèges insuffisants.',
      });
    }
    next();
  };
}

module.exports = { authenticate, requireRole };
