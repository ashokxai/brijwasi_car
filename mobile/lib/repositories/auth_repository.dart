import '../models/phone_auth_result.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthRepository {
  AuthRepository(this._service);

  final AuthService _service;

  Future<PhoneAuthSyncResult> syncPhoneLogin() => _service.syncPhoneLogin();

  Future<({String token, UserModel user})> completePhoneSignup(String email) =>
      _service.completePhoneSignup(email: email);

  Future<({String token, UserModel user})> login(String email, String password) =>
      _service.login(email: email, password: password);

  Future<({String token, UserModel user})> loginWithGoogle() =>
      _service.loginWithGoogle();

  Future<UserModel> profile() => _service.profile();

  Future<UserModel> updatePhone(String phone) => _service.updatePhone(phone);

  Future<void> logout() => _service.logout();
}
