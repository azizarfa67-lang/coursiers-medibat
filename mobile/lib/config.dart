// lib/config.dart
// Centralise les URLs du backend. À adapter selon l'environnement :
//  - Émulateur Android : 10.0.2.2 pointe vers le localhost de la machine hôte.
//  - Appareil physique / prod : remplacer par l'IP ou le domaine du serveur.

class AppConfig {
  static const String apiBaseUrl = 'http://10.0.2.2:5000/api';
  static const String socketUrl = 'http://10.0.2.2:5000';
}
