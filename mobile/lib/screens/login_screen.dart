// lib/screens/login_screen.dart
// Écran de connexion du coursier (téléphone + mot de passe).

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _telephoneCtrl = TextEditingController();
  final _motDePasseCtrl = TextEditingController();
  bool _chargement = false;
  String? _erreur;

  Future<void> _seConnecter() async {
    setState(() {
      _chargement = true;
      _erreur = null;
    });

    try {
      final data = await ApiService.login(_telephoneCtrl.text.trim(), _motDePasseCtrl.text);
      await StorageService.saveTokens(data['accessToken'], data['refreshToken']);
      await StorageService.saveCoursierId(data['coursier']['id']);

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } catch (e) {
      setState(() => _erreur = 'Numéro ou mot de passe incorrect.');
    } finally {
      setState(() => _chargement = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.delivery_dining, size: 80, color: Colors.orange),
              const SizedBox(height: 12),
              const Text(
                'Espace Coursier',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 32),
              TextField(
                controller: _telephoneCtrl,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Numéro de téléphone',
                  prefixIcon: Icon(Icons.phone),
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _motDePasseCtrl,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Mot de passe',
                  prefixIcon: Icon(Icons.lock),
                  border: OutlineInputBorder(),
                ),
              ),
              if (_erreur != null) ...[
                const SizedBox(height: 12),
                Text(_erreur!, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 24),
              FilledButton(
                onPressed: _chargement ? null : _seConnecter,
                style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                child: _chargement
                    ? const SizedBox(
                        height: 20, width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Se connecter'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
