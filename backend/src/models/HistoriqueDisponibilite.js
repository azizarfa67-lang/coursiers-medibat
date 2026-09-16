// src/models/HistoriqueDisponibilite.js
// Historise chaque changement de statut d'un coursier (traçabilité,
// statistiques d'activité, calcul de temps de disponibilité moyen, etc.)

module.exports = (sequelize, DataTypes) => {
  const HistoriqueDisponibilite = sequelize.define('HistoriqueDisponibilite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    coursier_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    statut_precedent: {
      type: DataTypes.ENUM('disponible', 'occupe', 'hors_ligne'),
      allowNull: true,
    },
    nouveau_statut: {
      type: DataTypes.ENUM('disponible', 'occupe', 'hors_ligne'),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    changed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'historique_disponibilites',
    updatedAt: false, // append-only : pas de updated_at nécessaire
    createdAt: 'created_at',
  });

  return HistoriqueDisponibilite;
};
