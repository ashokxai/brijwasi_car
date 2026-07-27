import 'package:flutter/material.dart';
import '../config/app_config.dart';
import '../config/theme.dart';

class BrandHeader extends StatelessWidget {
  const BrandHeader({
    super.key,
    this.subtitle = 'Welcome to DT Car Bazaar. Login to Buy or Sell.',
  });

  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 88,
          height: 88,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.gold.withValues(alpha: 0.15),
            border: Border.all(color: AppColors.gold, width: 2),
          ),
          child: const Center(
            child: Text(
              'DT',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: AppColors.charcoal,
              ),
            ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          AppConfig.appName,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: AppColors.charcoal,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          subtitle,
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey.shade700, height: 1.4),
        ),
      ],
    );
  }
}
