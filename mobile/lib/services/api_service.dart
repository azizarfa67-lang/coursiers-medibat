// lib/services/api_service.dart
// Centralise tous les appels HTTP vers le backend REST, avec injection
// automatique du token JWT dans l'en-tête Authorization.

import 'dart:convert';
import 'package:dio/dio.dart';
import '../config.dart';
import 'storage_service.dart';

class ApiService {
  static final Dio _dio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));

  static Future<Dio> _client() async {
    final token = await StorageService.getAccessToken();
    _dio.options.headers['Authorization'] = token != null ? 'Bearer $token' : null;
    _dio.options.headers['Content-Type'] = 'application/json';
    return _dio;
  }

  // --- Authentification ---

  static Future<Map<String, dynamic>> login(String telephone, String motDePasse) async {
    final response = await _dio.post('/auth/coursier/login', data: {
      'telephone': telephone,
      'mot_de_passe': motDePasse,
    });
    return response.data;
  }

  static Future<Map<String, dynamic>> register({
    required String nom,
    required String prenom,
    required String telephone,
    required String motDePasse,
    required String vehicule,
  }) async {
    final response = await _dio.post('/auth/coursier/register', data: {
      'nom': nom,
      'prenom': prenom,
      'telephone': telephone,
      'mot_de_passe': motDePasse,
      'vehicule': vehicule,
    });
    return response.data;
  }

  // --- Statut & position ---

  static Future<void> changerStatut(String statut) async {
    final client = await _client();
    await client.patch('/coursiers/statut', data: {'statut': statut});
  }

  static Future<void> mettreAJourPosition(double lat, double lng) async {
    final client = await _client();
    await client.patch('/coursiers/position', data: {'latitude': lat, 'longitude': lng});
  }

  static Future<void> enregistrerFcmToken(String fcmToken) async {
    final client = await _client();
    await client.post('/coursiers/fcm-token', data: {'fcm_token': fcmToken});
  }

  static Future<Map<String, dynamic>> getMonProfil() async {
    final client = await _client();
    final response = await client.get('/coursiers/me');
    return response.data;
  }

  // --- Missions ---

  static Future<List<dynamic>> getMesMissions() async {
    final client = await _client();
    final response = await client.get('/missions');
    return response.data['missions'];
  }

  static Future<void> changerStatutMission(int missionId, String statut) async {
    final client = await _client();
    await client.patch('/missions/$missionId/statut', data: {'statut': statut});
  }
}
