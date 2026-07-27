import '../models/user_model.dart';
import 'api_client.dart';

class AuthService {
  AuthService(this._api);

  final ApiClient _api;

  Future<({String token, UserModel user})> login({
    required String email,
    required String password,
  }) async {
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
    await _api.clearToken();
  }
}
