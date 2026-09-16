// lib/services/storage_service.dart
// Stockage sécurisé (Keychain / Keystore) des tokens JWT et infos de session.

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StorageService {
  static const _storage = FlutterSecureStorage();

  static Future<void> saveTokens(String accessToken, String refreshToken) async {
    await _storage.write(key: 'access_token', value: accessToken);
    await _storage.write(key: 'refresh_token', value: refreshToken);
  }

  static Future<String?> getAccessToken() => _storage.read(key: 'access_token');
  static Future<String?> getRefreshToken() => _storage.read(key: 'refresh_token');

  static Future<void> saveCoursierId(int id) async {
    await _storage.write(key: 'coursier_id', value: id.toString());
  }

  static Future<int?> getCoursierId() async {
    final val = await _storage.read(key: 'coursier_id');
    return val != null ? int.tryParse(val) : null;
  }

  static Future<void> clear() => _storage.deleteAll();
}
