import 'package:firebase_core/firebase_core.dart';

/// 1) Firebase Console → Project settings → Your apps → Android/Web config
/// 2) Paste values below (keep empty to use legacy API password login)
class DefaultFirebaseOptions {
  // TODO: paste from Firebase Console
  static const String apiKey = '';
  static const String appId = ''; // Android appId, e.g. 1:123:android:abc
  static const String messagingSenderId = '';
  static const String projectId = '';
  static const String authDomain = ''; // projectId.firebaseapp.com
  static const String storageBucket = '';

  static bool get isConfigured =>
      apiKey.isNotEmpty && appId.isNotEmpty && projectId.isNotEmpty;

  static FirebaseOptions get android {
    return FirebaseOptions(
      apiKey: apiKey,
      appId: appId,
      messagingSenderId: messagingSenderId,
      projectId: projectId,
      authDomain: authDomain.isEmpty ? null : authDomain,
      storageBucket: storageBucket.isEmpty ? null : storageBucket,
    );
  }
}
