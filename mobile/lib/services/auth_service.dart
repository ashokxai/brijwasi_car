import 'package:firebase_auth/firebase_auth.dart';
import '../models/user_model.dart';
import 'api_client.dart';
import 'firebase_service.dart';

class AuthService {
  AuthService(this._api);

  final ApiClient _api;

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
        throw Exception(_mapFirebaseError(e));
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

  Future<({String token, UserModel user})> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    if (FirebaseService.isConfigured) {
      try {
        final cred = await FirebaseService.auth.createUserWithEmailAndPassword(
          email: email.trim(),
          password: password,
        );
        await cred.user!.updateDisplayName(name.trim());
        final idToken = await cred.user!.getIdToken();
        final res = await _api.dio.post('/auth/firebase/register', data: {
          'idToken': idToken,
          'name': name,
          'phone': phone,
        });
        final token = res.data['token'] as String;
        await _api.saveToken(token);
        return (token: token, user: UserModel.fromJson(res.data['user']));
      } on FirebaseAuthException catch (e) {
        throw Exception(_mapFirebaseError(e));
      }
    }

    final res = await _api.dio.post('/register', data: {
      'name': name,
      'email': email,
      'phone': phone,
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
        await FirebaseService.auth.signOut();
      }
    } catch (_) {}
    await _api.clearToken();
  }

  String _mapFirebaseError(FirebaseAuthException e) {
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
      default:
        return e.message ?? 'Authentication failed';
    }
  }
}
