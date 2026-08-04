import 'package:flutter/material.dart';
import '../config/app_config.dart';
import '../config/theme.dart';
import 'app_logo.dart';

class BrandHeader extends StatelessWidget {
  const BrandHeader({
    super.key,
    this.subtitle = 'Login to Buy or Sell.',
    this.showWelcomeLine = true,
  });

  final String subtitle;
  final bool showWelcomeLine;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const AppLogo(height: 72),
        const SizedBox(height: 20),
        if (showWelcomeLine) ...[
          Text(
            'Welcome to ${AppConfig.appName}.',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: AppColors.charcoal,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 6),
        ],
        Text(
          subtitle,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 14,
            height: 1.4,
          ),
        ),
      ],
    );
  }
}
