// src/middleware/errorHandler.js
// Gestion centralisée des erreurs pour éviter de dupliquer les try/catch
// et renvoyer des réponses JSON cohérentes.

function notFoundHandler(req, res, next) {
  res.status(404).json({ success: false, message: `Route introuvable : ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error('❌ Erreur :', err);

  // Erreurs de validation Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Erreur de validation des données.',
      details: err.errors?.map((e) => e.message),
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erreur interne du serveur.',
  });
}

module.exports = { notFoundHandler, errorHandler };
