import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../config/app_config.dart';
import 'firebase_service.dart';

class GoogleAuthService {
  GoogleAuthService._();

  static GoogleSignIn get _googleSignIn {
    final webClientId = AppConfig.googleWebClientId.trim();
    return GoogleSignIn(
      scopes: const ['email', 'profile'],
      serverClientId: webClientId.isEmpty ? null : webClientId,
    );
  }

  /// Signs in with Google → Firebase Auth. Returns Firebase [User].
  static Future<User> signIn() async {
    if (!FirebaseService.isConfigured) {
      throw Exception('Firebase is not configured on this build');
    }

    final googleUser = await _googleSignIn.signIn();
    if (googleUser == null) {
      throw Exception('Google sign-in cancelled');
    }

    final googleAuth = await googleUser.authentication;
    final idToken = googleAuth.idToken;
    final accessToken = googleAuth.accessToken;

    if (idToken == null && accessToken == null) {
      throw Exception(
        'Google sign-in failed. In Firebase enable Google sign-in and add '
        'SHA-1 for this app, then set GOOGLE_WEB_CLIENT_ID (Web client ID).',
      );
    }

    final credential = GoogleAuthProvider.credential(
      idToken: idToken,
      accessToken: accessToken,
    );

    final cred = await FirebaseService.auth.signInWithCredential(credential);
    final user = cred.user;
    if (user == null) {
      throw Exception('Google sign-in failed. Please try again.');
    }
    return user;
  }

  static Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
    } catch (_) {}
  }
}
