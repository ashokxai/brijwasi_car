import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  /// Brand teal from UI mockups
  static const Color teal = Color(0xFF17B6A6);
  static const Color tealDark = Color(0xFF129E90);
  static const Color tealLight = Color(0xFFE8F7F5);
  static const Color tealMuted = Color(0xFFB2E8E2);

  /// Legacy names map to teal (keeps existing imports working)
  static const Color gold = teal;
  static const Color goldDark = tealDark;

  static const Color charcoal = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF757575);
  static const Color softGray = Color(0xFFF5F7FA);
  static const Color border = Color(0xFFE8ECF0);
  static const Color success = Color(0xFF2E7D32);
  static const Color whatsapp = Color(0xFF25D366);
}

class AppRadii {
  AppRadii._();

  static const double field = 28;
  static const double button = 28;
  static const double card = 16;
  static const double chip = 24;
}

class AppShadows {
  AppShadows._();

  static List<BoxShadow> get card => [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.06),
          blurRadius: 14,
          offset: const Offset(0, 4),
        ),
      ];

  static List<BoxShadow> get field => [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.05),
          blurRadius: 10,
          offset: const Offset(0, 2),
        ),
      ];

  static List<BoxShadow> get primaryButton => [
        BoxShadow(
          color: AppColors.teal.withValues(alpha: 0.38),
          blurRadius: 16,
          offset: const Offset(0, 6),
        ),
      ];
}

class AppGradients {
  AppGradients._();

  static const LinearGradient primaryButton = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFF1EC4B3), Color(0xFF17B6A6)],
  );

  static const LinearGradient authBackground = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFFF8FBFC), Color(0xFFF0F4F8)],
  );
}

ThemeData buildAppTheme() {
  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.teal,
      primary: AppColors.teal,
      surface: Colors.white,
    ),
    scaffoldBackgroundColor: AppColors.softGray,
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
      backgroundColor: Colors.white,
      foregroundColor: AppColors.charcoal,
      surfaceTintColor: Colors.transparent,
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(color: AppColors.teal),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadii.field),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadii.field),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadii.field),
        borderSide: const BorderSide(color: AppColors.teal, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadii.field),
        borderSide: BorderSide(color: Colors.red.shade300),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadii.button),
        ),
      ),
    ),
  );
}
