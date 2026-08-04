import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Becomes true after the branded splash animation finishes (~2.5s).
final splashPresentationCompleteProvider = StateProvider<bool>((ref) => false);
