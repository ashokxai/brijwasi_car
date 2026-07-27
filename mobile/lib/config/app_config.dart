class AppConfig {
  AppConfig._();

  /// Android emulator: 10.0.2.2 | iOS simulator: localhost | real device: your LAN IP
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:5050/api',
  );

  static const String appName = 'DT Car Bazaar';
  static const String contactPhone = '+918630930402';
  static const String contactWhatsapp = '918630930402';

  static String get callUrl => 'tel:$contactPhone';
  static String get whatsappUrl => 'https://wa.me/$contactWhatsapp';
}
