import 'package:firebase_core/firebase_core.dart';

/// Auto-generated from google-services.json — do not paste secrets from service accounts here.
class DefaultFirebaseOptions {
  static const String apiKey = 'AIzaSyCdvHvsjsA8kymo_RrhSfKrnQ2mHbdDBdo';
  static const String appId = '1:838288782435:android:eab31517a19b58eed3f456';
  static const String messagingSenderId = '838288782435';
  static const String projectId = 'brijwasicar';
  static const String authDomain = 'brijwasicar.firebaseapp.com';
  static const String storageBucket = 'brijwasicar.firebasestorage.app';

  static bool get isConfigured =>
      apiKey.isNotEmpty && appId.isNotEmpty && projectId.isNotEmpty;

  static FirebaseOptions get android {
    return FirebaseOptions(
      apiKey: apiKey,
      appId: appId,
      messagingSenderId: messagingSenderId,
      projectId: projectId,
      authDomain: authDomain,
      storageBucket: storageBucket,
    );
  }
}
