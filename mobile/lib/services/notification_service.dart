// lib/services/notification_service.dart
// Configure Firebase Cloud Messaging pour recevoir les notifications de
// nouvelles missions, et enregistre le token FCM auprès du backend.
// Prérequis : avoir ajouté le projet Firebase (google-services.json /
// GoogleService-Info.plist) et exécuté `flutterfire configure`.

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'api_service.dart';

class NotificationService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  static Future<void> initialiser() async {
    // Demande la permission (obligatoire sur iOS, recommandé sur Android 13+).
    await _messaging.requestPermission(alert: true, badge: true, sound: true);

    // Configuration des notifications locales (affichage au premier plan).
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidInit);
    await _localNotifications.initialize(initSettings);

    // Récupère et enregistre le token FCM auprès du backend.
    final token = await _messaging.getToken();
    if (token != null) {
      try {
        await ApiService.enregistrerFcmToken(token);
      } catch (e) {
        print('Erreur enregistrement token FCM : $e');
      }
    }

    // Réagit au renouvellement automatique du token.
    _messaging.onTokenRefresh.listen((newToken) {
      ApiService.enregistrerFcmToken(newToken).catchError((_) {});
    });

    // Affiche une notification locale quand l'app est au premier plan.
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      final notification = message.notification;
      if (notification != null) {
        _localNotifications.show(
          notification.hashCode,
          notification.title,
          notification.body,
          const NotificationDetails(
            android: AndroidNotificationDetails(
              'missions_channel',
              'Nouvelles missions',
              importance: Importance.high,
              priority: Priority.high,
            ),
          ),
        );
      }
    });
  }
}
