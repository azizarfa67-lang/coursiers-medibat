// lib/services/socket_service.dart
// Gère la connexion WebSocket (Socket.IO) : authentification par token,
// envoi de la position GPS en continu, et réception des nouvelles missions.

import 'package:socket_io_client/socket_io_client.dart' as io;
import '../config.dart';

class SocketService {
  static io.Socket? _socket;

  /// Établit la connexion socket authentifiée avec le token JWT.
  static void connect({
    required String token,
    required Function(Map<String, dynamic>) onNouvelleMission,
  }) {
    _socket = io.io(
      AppConfig.socketUrl,
      io.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .disableAutoConnect()
          .build(),
    );

    _socket!.connect();

    _socket!.onConnect((_) => print('✅ Socket connecté'));
    _socket!.onDisconnect((_) => print('🔌 Socket déconnecté'));
    _socket!.onConnectError((err) => print('❌ Erreur connexion socket : $err'));

    // Réception d'une nouvelle mission assignée en temps réel.
    _socket!.on('mission:nouvelle', (data) {
      onNouvelleMission(Map<String, dynamic>.from(data));
    });
  }

  /// Envoie la position GPS courante au serveur (diffusée aux admins).
  static void envoyerPosition(double lat, double lng) {
    _socket?.emit('position:update', {'latitude': lat, 'longitude': lng});
  }

  /// Envoie un changement de statut via le socket (alternative au REST).
  static void envoyerStatut(String statut) {
    _socket?.emit('statut:update', {'statut': statut});
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
  }
}
