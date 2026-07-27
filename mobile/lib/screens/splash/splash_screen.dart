import 'package:flutter/material.dart';
import '../../config/theme.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF2B2B2B), Color(0xFF111111)],
          ),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 42,
              backgroundColor: AppColors.gold,
              child: Text(
                'DT',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ),
            SizedBox(height: 18),
            Text(
              'DT Car Bazaar',
              style: TextStyle(
                color: Colors.white,
                fontSize: 26,
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Buy & Sell Trusted Used Cars',
              style: TextStyle(color: AppColors.gold),
            ),
            SizedBox(height: 28),
            CircularProgressIndicator(color: AppColors.gold),
          ],
        ),
      ),
    );
  }
}
