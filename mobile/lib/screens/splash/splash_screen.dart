import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/splash_provider.dart';
import '../../widgets/splash/animated_car_headlights.dart';
import '../../widgets/splash/splash_brand_text.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  static const _brijwasi = 'Brijwasi';
  static const _totalDuration = Duration(milliseconds: 2600);
  static const _typingDuration = Duration(milliseconds: 1300);

  Timer? _tickTimer;
  Timer? _completeTimer;
  int _typed = 0;
  double _restOpacity = 0;

  @override
  void initState() {
    super.initState();
    _startAnimation();
  }

  void _startAnimation() {
    final letterMs = _typingDuration.inMilliseconds ~/ _brijwasi.length;
    _tickTimer = Timer.periodic(Duration(milliseconds: letterMs), (timer) {
      if (!mounted) return;
      setState(() {
        _typed++;
        if (_typed >= _brijwasi.length) {
          timer.cancel();
          _fadeInRest();
        }
      });
    });

    _completeTimer = Timer(_totalDuration, () {
      if (!mounted) return;
      ref.read(splashPresentationCompleteProvider.notifier).state = true;
    });
  }

  void _fadeInRest() {
    const steps = 12;
    var step = 0;
    Timer.periodic(const Duration(milliseconds: 40), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      step++;
      setState(() {
        _restOpacity = (step / steps).clamp(0.0, 1.0);
      });
      if (step >= steps) timer.cancel();
    });
  }

  @override
  void dispose() {
    _tickTimer?.cancel();
    _completeTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final compact = width < 360;
    final carHeight = compact ? 96.0 : 120.0;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: FittedBox(
              fit: BoxFit.scaleDown,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  AnimatedCarHeadlights(height: carHeight),
                  SizedBox(width: compact ? 12 : 18),
                  SplashBrandText(
                    typedBrijwasiLength: _typed,
                    restOpacity: _restOpacity,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
