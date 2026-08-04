import 'dart:async';

import 'package:dio/dio.dart';
import '../config/app_config.dart';

String apiErrorMessage(Object e, {String fallback = 'Something went wrong. Please try again.'}) {
  if (e is DioException) {
    final data = e.response?.data;
    if (data is Map && data['message'] is String && (data['message'] as String).isNotEmpty) {
      return data['message'] as String;
    }
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout ||
        e.type == DioExceptionType.sendTimeout) {
      return AppConfig.requestTimeoutMessage;
    }
    if (e.type == DioExceptionType.connectionError) {
      return 'Cannot reach server. Check your internet connection and try again.';
    }
    if (e.response?.statusCode == 401) {
      return 'Invalid email or password';
    }
    if (e.response?.statusCode == 403) {
      return data is Map && data['message'] is String
          ? data['message'] as String
          : 'Access denied';
    }
  }

  if (e is TimeoutException) {
    return AppConfig.requestTimeoutMessage;
  }

  try {
    final msg = (e as dynamic).response?.data?['message'];
    if (msg is String && msg.isNotEmpty) return msg;
  } catch (_) {}

  final raw = e.toString();
  if (raw.startsWith('Exception: ')) {
    return raw.substring('Exception: '.length);
  }
  return fallback;
}
