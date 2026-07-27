import '../config/app_config.dart';

String resolveImageUrl(String path) {
  if (path.isEmpty) return '';
  if (path.startsWith('http')) return path;
  final host = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/api/?$'), '');
  return '$host$path';
}

String formatPrice(num price) {
  final value = price.round();
  final str = value.toString();
  final result = StringBuffer();
  final chars = str.split('').reversed.toList();
  for (var i = 0; i < chars.length; i++) {
    if (i == 3 || (i > 3 && (i - 3) % 2 == 0)) {
      result.write(',');
    }
    result.write(chars[i]);
  }
  return '₹${result.toString().split('').reversed.join()}';
}
