// src/models/Coursier.js
// Représente un coursier : ses infos de compte, son statut courant et sa
// dernière position connue (mise à jour en temps réel via WebSocket).

module.exports = (sequelize, DataTypes) => {
  const Coursier = sequelize.define('Coursier', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    prenom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      unique: true,
      validate: { isEmail: true },
    },
    mot_de_passe: {
      type: DataTypes.STRING(255),
      allowNull: false, // stocké hashé (bcrypt)
    },
    vehicule: {
      type: DataTypes.ENUM('moto', 'velo', 'voiture', 'camionnette'),
      allowNull: false,
      defaultValue: 'moto',
    },
    statut: {
      type: DataTypes.ENUM('disponible', 'occupe', 'hors_ligne'),
      allowNull: false,
      defaultValue: 'hors_ligne',
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    derniere_position_maj: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fcm_token: {
      type: DataTypes.STRING(255),
      allowNull: true, // token push notification (Firebase Cloud Messaging)
    },
    actif: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // compte activé/désactivé par l'admin
    },
  }, {
    tableName: 'coursiers',
    indexes: [
      { fields: ['statut'] },
      { fields: ['latitude', 'longitude'] },
    ],
  });

  return Coursier;
};
