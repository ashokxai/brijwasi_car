class AppConfig {
  AppConfig._();

  /// Android emulator: 10.0.2.2 | iOS simulator: localhost | real device: your LAN IP
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://127.0.0.1:5050/api',
  );

  static const String appName = 'Brijwasi Car Bazaar';
  static const String contactPhone = '+917060221729';
  static const String contactWhatsapp = '917060221729';

  /// Public legal pages (host on admin Vercel or any HTTPS site for Play Console).
  static const String privacyPolicyUrl = String.fromEnvironment(
    'PRIVACY_POLICY_URL',
    defaultValue: 'https://brijwasi-car.vercel.app/privacy-policy.html',
  );
  static const String termsOfServiceUrl = String.fromEnvironment(
    'TERMS_OF_SERVICE_URL',
    defaultValue: 'https://brijwasi-car.vercel.app/terms-of-service.html',
  );

  static const Duration apiConnectTimeout = Duration(seconds: 30);
  static const Duration apiReceiveTimeout = Duration(seconds: 30);

  static const String requestTimeoutMessage =
      'Request timed out. Check your connection and try again.';

  static String get callUrl => 'tel:$contactPhone';
  static String get whatsappUrl => 'https://wa.me/$contactWhatsapp';
}
