import 'package:flutter/material.dart';
import '../config/theme.dart';

/// Compact logo for app bars (horizontal lockup — prefer [width] in narrow headers).
class AppLogo extends StatelessWidget {
  const AppLogo({super.key, this.height, this.width});

  final double? height;
  final double? width;

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/logo.png',
      height: height,
      width: width,
      fit: BoxFit.contain,
      filterQuality: FilterQuality.high,
    );
  }
}

class AppLogoTitle extends StatelessWidget {
  const AppLogoTitle({super.key, this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    if (compact) {
      return const AppLogo(height: 40);
    }
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const AppLogo(height: 56),
        const SizedBox(height: 8),
        RichText(
          textAlign: TextAlign.center,
          text: const TextSpan(
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, height: 1.2),
            children: [
              TextSpan(text: 'Welcome to ', style: TextStyle(color: AppColors.charcoal)),
              TextSpan(text: 'Brijwasi Car Bazaar', style: TextStyle(color: AppColors.charcoal)),
            ],
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Login to Buy or Sell.',
          style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
        ),
      ],
    );
  }
}
