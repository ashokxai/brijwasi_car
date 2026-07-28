import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import '../config/firebase_options.dart';

class FirebaseService {
  FirebaseService._();

  static bool get isConfigured => DefaultFirebaseOptions.isConfigured;

  static Future<void> init() async {
    if (!isConfigured) return;
    await Firebase.initializeApp(options: DefaultFirebaseOptions.android);
  }

  static FirebaseAuth get auth => FirebaseAuth.instance;
}
