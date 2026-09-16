// lib/main.dart
// Point d'entrée de l'application coursier.

import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'services/storage_service.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialise Firebase (nécessaire pour les notifications push FCM).
  // Nécessite d'avoir exécuté `flutterfire configure` au préalable.
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('⚠️ Firebase non initialisé : $e');
  }

  final token = await StorageService.getAccessToken();
  runApp(CoursierApp(dejaConnecte: token != null));
}

class CoursierApp extends StatelessWidget {
  final bool dejaConnecte;
  const CoursierApp({super.key, required this.dejaConnecte});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Coursier App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.orange,
        useMaterial3: true,
        colorSchemeSeed: Colors.orange,
      ),
      home: dejaConnecte ? const HomeScreen() : const LoginScreen(),
    );
  }
}
