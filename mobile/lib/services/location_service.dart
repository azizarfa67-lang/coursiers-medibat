// lib/services/location_service.dart
// Demande les permissions GPS et fournit un flux (stream) de positions,
// utilisé pour la mise à jour en temps réel affichée sur la carte admin.

import 'package:geolocator/geolocator.dart';

class LocationService {
  /// Vérifie/demande les permissions nécessaires. Retourne false si refusées.
  static Future<bool> demanderPermissions() async {
    bool serviceActif = await Geolocator.isLocationServiceEnabled();
    if (!serviceActif) return false;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return false;
    }
    if (permission == LocationPermission.deniedForever) return false;

    return true;
  }

  static Future<Position> positionActuelle() {
    return Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  /// Flux continu de positions — se déclenche à chaque déplacement de
  /// `distanceFilter` mètres, pour limiter la consommation batterie/réseau.
  static Stream<Position> flotPositions({int distanceFilterMetres = 20}) {
    return Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: distanceFilterMetres,
      ),
    );
  }
}
