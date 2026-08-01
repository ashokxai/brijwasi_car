import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';

class ApiClient {
  ApiClient({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
            ) {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: AppConfig.apiConnectTimeout,
        receiveTimeout: AppConfig.apiReceiveTimeout,
        headers: {'Content-Type': 'application/json'},
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          try {
            final token = await _storage.read(key: 'auth_token');
            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
            }
          } catch (e) {
            debugPrint('Token read failed: $e');
          }
          handler.next(options);
        },
      ),
    );
  }

  late final Dio _dio;
  final FlutterSecureStorage _storage;

  Dio get dio => _dio;

  Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: 'auth_token', value: token);
    } catch (e) {
      debugPrint('Token save failed: $e');
    }
  }

  Future<void> clearToken() async {
    try {
      await _storage.delete(key: 'auth_token');
    } catch (e) {
      debugPrint('Token clear failed: $e');
    }
  }

  Future<String?> getToken() async {
    try {
      return await _storage.read(key: 'auth_token').timeout(
            const Duration(seconds: 3),
            onTimeout: () => null,
          );
    } catch (e) {
      debugPrint('Token get failed: $e');
      return null;
    }
  }
}
