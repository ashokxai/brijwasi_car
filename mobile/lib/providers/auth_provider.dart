import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../config/app_config.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../utils/api_errors.dart';

final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final api = ref.watch(apiClientProvider);
  return AuthRepository(AuthService(api));
});

class AuthState {
  const AuthState({
    this.user,
    this.isLoading = false,
    this.isAuthenticated = false,
    this.error,
  });

  final UserModel? user;
  final bool isLoading;
  final bool isAuthenticated;
  final String? error;

  AuthState copyWith({
    UserModel? user,
    bool? isLoading,
    bool? isAuthenticated,
    String? error,
    bool clearError = false,
    bool clearUser = false,
  }) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._repo, this._api) : super(const AuthState()) {
    bootstrap();
  }

  final AuthRepository _repo;
  final ApiClient _api;

  Future<void> bootstrap() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final token = await _api.getToken();
      if (token == null || token.isEmpty) {
        state = const AuthState(isLoading: false, isAuthenticated: false);
        return;
      }
      final user = await _repo.profile().timeout(AppConfig.apiReceiveTimeout);
      state = AuthState(user: user, isAuthenticated: true, isLoading: false);
    } catch (e) {
      debugPrint('Auth bootstrap failed: $e');
      await _api.clearToken();
      state = const AuthState(isLoading: false, isAuthenticated: false);
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(
      isLoading: true,
      clearError: true,
      isAuthenticated: false,
      clearUser: true,
    );
    try {
      final result = await _repo.login(email, password);
      state = AuthState(
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = AuthState(
        isLoading: false,
        isAuthenticated: false,
        error: _extractError(e),
      );
      return false;
    }
  }

  Future<bool> register({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) async {
    state = state.copyWith(
      isLoading: true,
      clearError: true,
      isAuthenticated: false,
      clearUser: true,
    );
    try {
      final result = await _repo.register(
        name: name,
        email: email,
        phone: phone,
        password: password,
      );
      state = AuthState(
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
      );
      return true;
    } catch (e) {
      state = AuthState(
        isLoading: false,
        isAuthenticated: false,
        error: _extractError(e),
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthState();
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }

  String _extractError(Object e) {
    return apiErrorMessage(
      e,
      fallback: 'Login failed. Please check your details and try again.',
    );
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.watch(authRepositoryProvider),
    ref.watch(apiClientProvider),
  );
});
