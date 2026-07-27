import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthRepository {
  AuthRepository(this._service);

  final AuthService _service;

  Future<({String token, UserModel user})> login(String email, String password) =>
      _service.login(email: email, password: password);

  Future<({String token, UserModel user})> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) =>
      _service.register(
        name: name,
        email: email,
        phone: phone,
        password: password,
      );

  Future<UserModel> profile() => _service.profile();

  Future<void> logout() => _service.logout();
}
