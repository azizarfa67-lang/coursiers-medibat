// lib/models/coursier.dart
// Représente le coursier connecté (profil + statut courant).

enum StatutCoursier { disponible, occupe, horsLigne }

StatutCoursier statutFromString(String s) {
  switch (s) {
    case 'disponible':
      return StatutCoursier.disponible;
    case 'occupe':
      return StatutCoursier.occupe;
    default:
      return StatutCoursier.horsLigne;
  }
}

String statutToString(StatutCoursier s) {
  switch (s) {
    case StatutCoursier.disponible:
      return 'disponible';
    case StatutCoursier.occupe:
      return 'occupe';
    case StatutCoursier.horsLigne:
      return 'hors_ligne';
  }
}

class Coursier {
  final int id;
  final String nom;
  final String prenom;
  final String telephone;
  final String vehicule;
  StatutCoursier statut;
  double? latitude;
  double? longitude;

  Coursier({
    required this.id,
    required this.nom,
    required this.prenom,
    required this.telephone,
    required this.vehicule,
    required this.statut,
    this.latitude,
    this.longitude,
  });

  factory Coursier.fromJson(Map<String, dynamic> json) {
    return Coursier(
      id: json['id'],
      nom: json['nom'] ?? '',
      prenom: json['prenom'] ?? '',
      telephone: json['telephone'] ?? '',
      vehicule: json['vehicule'] ?? 'moto',
      statut: statutFromString(json['statut'] ?? 'hors_ligne'),
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
    );
  }
}
