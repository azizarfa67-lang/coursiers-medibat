// lib/screens/home_screen.dart
// Écran principal du coursier : carte OpenStreetMap centrée sur sa position,
// sélecteur de statut, diffusion GPS en temps réel via WebSocket, et
// réception des nouvelles missions poussées par le serveur.

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';

import '../models/coursier.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';
import '../services/socket_service.dart';
import '../services/notification_service.dart';
import '../services/storage_service.dart';
import '../widgets/statut_selector.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  StatutCoursier _statut = StatutCoursier.horsLigne;
  LatLng? _positionActuelle;
  StreamSubscription<Position>? _positionSub;
  final MapController _mapController = MapController();
  Map<String, dynamic>? _missionEnCours;

  @override
  void initState() {
    super.initState();
    _initialiser();
  }

  Future<void> _initialiser() async {
    // 1. Récupère le profil (statut sauvegardé côté serveur).
    try {
      final profil = await ApiService.getMonProfil();
      setState(() => _statut = statutFromString(profil['coursier']['statut']));
    } catch (_) {}

    // 2. Permissions GPS + position initiale.
    final autorise = await LocationService.demanderPermissions();
    if (!autorise) {
      _afficherMessage('Permission de localisation refusée. Activez-la pour continuer.');
      return;
    }
    final position = await LocationService.positionActuelle();
    setState(() => _positionActuelle = LatLng(position.latitude, position.longitude));

    // 3. Connexion WebSocket pour le temps réel + notifications.
    final token = await StorageService.getAccessToken();
    if (token != null) {
      SocketService.connect(
        token: token,
        onNouvelleMission: (mission) {
          setState(() => _missionEnCours = mission['mission']);
          _afficherMessage('📦 Nouvelle mission reçue !');
        },
      );
    }
    await NotificationService.initialiser();

    // 4. Diffusion continue de la position (GPS -> API + WebSocket).
    _positionSub = LocationService.flotPositions().listen((pos) {
      final latlng = LatLng(pos.latitude, pos.longitude);
      setState(() => _positionActuelle = latlng);
      SocketService.envoyerPosition(pos.latitude, pos.longitude);
      // Persistance REST en secours (moins fréquente serait idéale en prod,
      // ex. via un throttle ; simplifié ici pour la démonstration).
      ApiService.mettreAJourPosition(pos.latitude, pos.longitude).catchError((_) {});
    });
  }

  Future<void> _changerStatut(StatutCoursier nouveau) async {
    setState(() => _statut = nouveau);
    final statutStr = statutToString(nouveau);
    try {
      await ApiService.changerStatut(statutStr);
      SocketService.envoyerStatut(statutStr);
    } catch (e) {
      _afficherMessage('Erreur lors de la mise à jour du statut.');
    }
  }

  void _afficherMessage(String texte) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(texte)));
  }

  Future<void> _seDeconnecter() async {
    SocketService.disconnect();
    await StorageService.clear();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const LoginScreen()));
  }

  @override
  void dispose() {
    _positionSub?.cancel();
    SocketService.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Coursier'),
        actions: [
          IconButton(icon: const Icon(Icons.logout), onPressed: _seDeconnecter),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: StatutSelector(statutActuel: _statut, onChanged: _changerStatut),
          ),
          if (_missionEnCours != null) _buildBandeauMission(),
          Expanded(
            child: _positionActuelle == null
                ? const Center(child: CircularProgressIndicator())
                : FlutterMap(
                    mapController: _mapController,
                    options: MapOptions(initialCenter: _positionActuelle!, initialZoom: 15),
                    children: [
                      TileLayer(
                        urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.example.coursier_app',
                      ),
                      MarkerLayer(markers: [
                        Marker(
                          point: _positionActuelle!,
                          width: 40,
                          height: 40,
                          child: const Icon(Icons.two_wheeler, color: Colors.orange, size: 36),
                        ),
                      ]),
                    ],
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildBandeauMission() {
    final mission = _missionEnCours!;
    return Container(
      width: double.infinity,
      color: Colors.orange.shade100,
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('📦 Mission en cours', style: TextStyle(fontWeight: FontWeight.bold)),
          Text('Départ : ${mission['adresse_depart']}'),
          Text('Arrivée : ${mission['adresse_arrivee']}'),
          const SizedBox(height: 8),
          Row(
            children: [
              FilledButton(
                onPressed: () async {
                  await ApiService.changerStatutMission(mission['id'], 'en_cours');
                  _afficherMessage('Mission démarrée.');
                },
                child: const Text('Démarrer'),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: () async {
                  await ApiService.changerStatutMission(mission['id'], 'terminee');
                  setState(() => _missionEnCours = null);
                  _afficherMessage('Mission terminée. Vous êtes de nouveau disponible.');
                },
                child: const Text('Terminer'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
