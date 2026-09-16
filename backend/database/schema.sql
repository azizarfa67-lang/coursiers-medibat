-- ============================================================================
-- Schéma de base de données : Application de suivi de disponibilité des
-- coursiers en temps réel.
-- SGBD : MySQL 8+
-- Note : ce schéma est fourni pour référence / installation manuelle.
-- En développement, Sequelize (sync({alter:true})) crée/maintient déjà
-- ces tables automatiquement au démarrage du serveur.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS coursier_tracking
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE coursier_tracking;

-- ----------------------------------------------------------------------------
-- Table : coursiers
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coursiers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(150) UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  vehicule ENUM('moto', 'velo', 'voiture', 'camionnette') NOT NULL DEFAULT 'moto',
  statut ENUM('disponible', 'occupe', 'hors_ligne') NOT NULL DEFAULT 'hors_ligne',
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  derniere_position_maj DATETIME NULL,
  fcm_token VARCHAR(255) NULL,
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_statut (statut),
  INDEX idx_position (latitude, longitude)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table : admins
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table : missions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS missions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coursier_id INT NULL,
  adresse_depart VARCHAR(255) NOT NULL,
  latitude_depart DECIMAL(10, 7) NOT NULL,
  longitude_depart DECIMAL(10, 7) NOT NULL,
  adresse_arrivee VARCHAR(255) NOT NULL,
  latitude_arrivee DECIMAL(10, 7) NOT NULL,
  longitude_arrivee DECIMAL(10, 7) NOT NULL,
  description TEXT NULL,
  statut ENUM('en_attente', 'assignee', 'en_cours', 'terminee', 'annulee') NOT NULL DEFAULT 'en_attente',
  priorite ENUM('normale', 'urgente') NOT NULL DEFAULT 'normale',
  assignee_at DATETIME NULL,
  terminee_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mission_statut (statut),
  INDEX idx_mission_coursier (coursier_id),
  CONSTRAINT fk_mission_coursier FOREIGN KEY (coursier_id)
    REFERENCES coursiers(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Table : historique_disponibilites
-- (traçabilité de chaque changement de statut, pour statistiques)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historique_disponibilites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coursier_id INT NOT NULL,
  statut_precedent ENUM('disponible', 'occupe', 'hors_ligne') NULL,
  nouveau_statut ENUM('disponible', 'occupe', 'hors_ligne') NOT NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historique_coursier FOREIGN KEY (coursier_id)
    REFERENCES coursiers(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- Compte admin par défaut (mot de passe à changer immédiatement après
-- installation). Mot de passe "admin123" haché avec bcrypt (10 rounds).
-- Génère ton propre hash avec : node -e "console.log(require('bcryptjs').hashSync('ton_mdp',10))"
-- ----------------------------------------------------------------------------
-- INSERT INTO admins (nom, email, mot_de_passe) VALUES
-- ('Administrateur', 'admin@coursier-app.com', '$2a$10$REMPLACER_PAR_UN_HASH_BCRYPT');
