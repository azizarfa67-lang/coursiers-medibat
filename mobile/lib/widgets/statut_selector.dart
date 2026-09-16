// lib/widgets/statut_selector.dart
// Bouton segmenté permettant au coursier de basculer entre les 3 statuts.

import 'package:flutter/material.dart';
import '../models/coursier.dart';

class StatutSelector extends StatelessWidget {
  final StatutCoursier statutActuel;
  final ValueChanged<StatutCoursier> onChanged;

  const StatutSelector({
    super.key,
    required this.statutActuel,
    required this.onChanged,
  });

  Color _couleur(StatutCoursier s) {
    switch (s) {
      case StatutCoursier.disponible:
        return Colors.green;
      case StatutCoursier.occupe:
        return Colors.orange;
      case StatutCoursier.horsLigne:
        return Colors.grey;
    }
  }

  String _label(StatutCoursier s) {
    switch (s) {
      case StatutCoursier.disponible:
        return 'Disponible';
      case StatutCoursier.occupe:
        return 'Occupé';
      case StatutCoursier.horsLigne:
        return 'Hors ligne';
    }
  }

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<StatutCoursier>(
      segments: StatutCoursier.values.map((s) {
        return ButtonSegment<StatutCoursier>(
          value: s,
          label: Text(_label(s)),
          icon: Icon(Icons.circle, color: _couleur(s), size: 14),
        );
      }).toList(),
      selected: {statutActuel},
      onSelectionChanged: (nouveauSet) => onChanged(nouveauSet.first),
    );
  }
}
