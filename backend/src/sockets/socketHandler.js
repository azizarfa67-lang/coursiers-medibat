// src/sockets/socketHandler.js
// Gère les connexions WebSocket (Socket.IO) pour le suivi temps réel :
//  - Les coursiers rejoignent leur salle personnelle "coursier:<id>" (pour
//    recevoir leurs missions) et émettent "position:update" en continu.
//  - Le dashboard admin rejoint la salle "admins" pour recevoir toutes les
//    mises à jour de statut/position en direct.
//
// L'authentification du socket se fait via le token JWT passé dans le
// handshake (auth.token), afin d'éviter les connexions anonymes.

const { verifyAccessToken } = require('../utils/jwt');
const { Coursier } = require('../models');

function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentification requise (token manquant).'));

  try {
    const decoded = verifyAccessToken(token);
    socket.user = decoded; // { id, role }
    next();
  } catch (err) {
    next(new Error('Token invalide ou expiré.'));
  }
}

function registerSocketHandlers(io) {
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const { id, role } = socket.user;
    console.log(`🔌 Connexion socket : ${role} #${id} (${socket.id})`);

    // Chaque type de client rejoint sa salle logique.
    if (role === 'admin') {
      socket.join('admins');
    } else if (role === 'coursier') {
      socket.join(`coursier:${id}`);
    }

    // --- Un coursier diffuse sa position en temps réel (haute fréquence) ---
    // Le client mobile émet cet événement toutes les quelques secondes
    // pendant qu'il est en mission ou disponible.
    socket.on('position:update', async (data) => {
      try {
        if (role !== 'coursier') return;
        const { latitude, longitude } = data;
        if (latitude === undefined || longitude === undefined) return;

        // Persistance asynchrone (ne bloque pas la diffusion temps réel).
        Coursier.update(
          { latitude, longitude, derniere_position_maj: new Date() },
          { where: { id } }
        ).catch((err) => console.error('Erreur maj position DB :', err.message));

        // Diffusion immédiate au dashboard admin.
        io.to('admins').emit('coursier:position_update', {
          coursierId: id,
          latitude,
          longitude,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('Erreur socket position:update :', err.message);
      }
    });

    // --- Un coursier change son statut via socket (alternative au REST) ---
    socket.on('statut:update', async (data) => {
      try {
        if (role !== 'coursier') return;
        const { statut } = data;
        if (!['disponible', 'occupe', 'hors_ligne'].includes(statut)) return;

        await Coursier.update({ statut }, { where: { id } });

        io.to('admins').emit('coursier:statut_change', {
          coursierId: id,
          statut,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('Erreur socket statut:update :', err.message);
      }
    });

    // --- Déconnexion : on marque le coursier hors ligne ---
    socket.on('disconnect', async () => {
      console.log(`🔌 Déconnexion : ${role} #${id}`);
      if (role === 'coursier') {
        try {
          await Coursier.update({ statut: 'hors_ligne' }, { where: { id } });
          io.to('admins').emit('coursier:statut_change', {
            coursierId: id,
            statut: 'hors_ligne',
            timestamp: new Date(),
          });
        } catch (err) {
          console.error('Erreur maj statut à la déconnexion :', err.message);
        }
      }
    });
  });
}

module.exports = { registerSocketHandlers };
