import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/phone_auth_result.dart';
import '../models/user_model.dart';
import 'api_client.dart';
import 'firebase_service.dart';
import 'google_auth_service.dart';
import 'phone_auth_service.dart';

class AuthService {
  AuthService(this._api);

  final ApiClient _api;

  Future<PhoneAuthSyncResult> syncPhoneLogin() async {
    if (!FirebaseService.isConfigured) {
      throw Exception('Firebase is not configured on this build');
    }
    final idToken = await PhoneAuthService.currentIdToken();
    if (idToken == null || idToken.isEmpty) {
      throw Exception('Phone verification expired. Please request OTP again.');
    }

    try {
      final res = await _api.dio.post('/auth/firebase/phone/login', data: {
        'idToken': idToken,
      });
      final token = res.data['token'] as String;
      await _api.saveToken(token);
      return PhoneAuthSyncResult.signedIn(
        token: token,
        user: UserModel.fromJson(res.data['user']),
      );
    } on DioException catch (e) {
      final data = e.response?.data;
      if (e.response?.statusCode == 404 &&
          data is Map &&
          data['code'] == 'NEEDS_EMAIL') {
        return PhoneAuthSyncResult.needsEmail(
          phone: data['phone']?.toString(),
        );
      }
      rethrow;
    }
  }

  Future<({String token, UserModel user})> completePhoneSignup({
    required String email,
  }) async {
    final idToken = await PhoneAuthService.currentIdToken();
    if (idToken == null || idToken.isEmpty) {
      throw Exception('Phone verification expired. Please login with OTP again.');
    }

    final res = await _api.dio.post('/auth/firebase/phone/complete', data: {
      'idToken': idToken,
      'email': email.trim(),
    });
    final token = res.data['token'] as String;
    await _api.saveToken(token);
    return (token: token, user: UserModel.fromJson(res.data['user']));
  }

  Future<({String token, UserModel user})> loginWithGoogle() async {
    try {
      final user = await GoogleAuthService.signIn();
      final idToken = await user.getIdToken();
      if (idToken == null || idToken.isEmpty) {
        throw Exception('Could not verify Google account. Please try again.');
      }
      final res = await _api.dio.post('/auth/firebase/login', data: {
        'idToken': idToken,
      });
      final token = res.data['token'] as String;
      await _api.saveToken(token);
      return (token: token, user: UserModel.fromJson(res.data['user']));
    } on FirebaseAuthException catch (e) {
      throw Exception(mapFirebaseAuthError(e));
    }
  }

  Future<({String token, UserModel user})> login({
    required String email,
    required String password,
  }) async {
    if (FirebaseService.isConfigured) {
      try {
        final cred = await FirebaseService.auth.signInWithEmailAndPassword(
          email: email.trim(),
          password: password,
        );
        final idToken = await cred.user!.getIdToken();
        final res = await _api.dio.post('/auth/firebase/login', data: {
          'idToken': idToken,
        });
        final token = res.data['token'] as String;
        await _api.saveToken(token);
        return (token: token, user: UserModel.fromJson(res.data['user']));
      } on FirebaseAuthException catch (e) {
        throw Exception(mapFirebaseAuthError(e));
      }
    }

    final res = await _api.dio.post('/login', data: {
      'email': email,
      'password': password,
    });
    final token = res.data['token'] as String;
    await _api.saveToken(token);
    return (token: token, user: UserModel.fromJson(res.data['user']));
  }

  Future<UserModel> profile() async {
    final res = await _api.dio.get('/profile');
    return UserModel.fromJson(res.data['user']);
  }

  Future<void> logout() async {
    try {
      await _api.dio.post('/logout');
    } catch (_) {}
    try {
      if (FirebaseService.isConfigured) {
        await GoogleAuthService.signOut();
        await FirebaseService.auth.signOut();
      }
    } catch (_) {}
    await _api.clearToken();
  }

  static String mapFirebaseAuthError(FirebaseAuthException e) {
    switch (e.code) {
      case 'invalid-credential':
      case 'wrong-password':
      case 'user-not-found':
      case 'invalid-email':
        return 'Invalid email or password';
      case 'email-already-in-use':
        return 'Email already registered';
      case 'weak-password':
        return 'Password is too weak';
      case 'too-many-requests':
        return 'Too many attempts. Try again later.';
      case 'invalid-phone-number':
        return 'Invalid mobile number';
      case 'invalid-verification-code':
        return 'Invalid OTP. Please check and try again.';
      case 'session-expired':
        return 'OTP expired. Please request a new code.';
      case 'quota-exceeded':
        return 'SMS limit reached. Try again later.';
      case 'missing-verification-code':
        return 'Enter the OTP sent to your phone';
      case 'account-exists-with-different-credential':
        return 'This email is already used with another sign-in method.';
      case 'app-not-authorized':
        return 'Could not verify this app. Please update the app or try again.';
      default:
        return e.message ?? 'Authentication failed';
    }
  }
}
