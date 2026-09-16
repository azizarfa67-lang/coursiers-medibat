// lib/models/mission.dart
// Représente une mission (course) assignée au coursier.

class Mission {
  final int id;
  final String adresseDepart;
  final double latitudeDepart;
  final double longitudeDepart;
  final String adresseArrivee;
  final double latitudeArrivee;
  final double longitudeArrivee;
  final String? description;
  String statut;
  final String priorite;

  Mission({
    required this.id,
    required this.adresseDepart,
    required this.latitudeDepart,
    required this.longitudeDepart,
    required this.adresseArrivee,
    required this.latitudeArrivee,
    required this.longitudeArrivee,
    this.description,
    required this.statut,
    required this.priorite,
  });

  factory Mission.fromJson(Map<String, dynamic> json) {
    return Mission(
      id: json['id'],
      adresseDepart: json['adresse_depart'] ?? '',
      latitudeDepart: double.tryParse(json['latitude_depart'].toString()) ?? 0,
      longitudeDepart: double.tryParse(json['longitude_depart'].toString()) ?? 0,
      adresseArrivee: json['adresse_arrivee'] ?? '',
      latitudeArrivee: double.tryParse(json['latitude_arrivee'].toString()) ?? 0,
      longitudeArrivee: double.tryParse(json['longitude_arrivee'].toString()) ?? 0,
      description: json['description'],
      statut: json['statut'] ?? 'en_attente',
      priorite: json['priorite'] ?? 'normale',
    );
  }
}
