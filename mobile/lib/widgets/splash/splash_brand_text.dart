import 'package:flutter/material.dart';

/// Matches the official logo typography: typed "Brijwasi", then "Car" + BAZAAR.
class SplashBrandText extends StatelessWidget {
  const SplashBrandText({
    super.key,
    required this.typedBrijwasiLength,
    required this.restOpacity,
  });

  static const String _brijwasi = 'Brijwasi';
  static const Color _teal = Color(0xFF17B6A6);
  static const Color _black = Color(0xFF1A1A1A);

  final int typedBrijwasiLength;
  final double restOpacity;

  @override
  Widget build(BuildContext context) {
    final typed = _brijwasi.substring(
      0,
      typedBrijwasiLength.clamp(0, _brijwasi.length),
    );
    // Avoid a lone "B" sitting beside the car — looks like a stray glyph.
    final displayTyped = typed.length < 2 ? '' : typed;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(
              displayTyped,
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: _teal,
                height: 1.1,
                letterSpacing: -0.3,
              ),
            ),
            Opacity(
              opacity: restOpacity,
              child: const Text(
                ' Car',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: _black,
                  height: 1.1,
                  letterSpacing: -0.3,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Opacity(
          opacity: restOpacity,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 28,
                height: 2,
                color: _teal,
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 10),
                child: Text(
                  'BAZAAR',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: _black,
                    letterSpacing: 4,
                  ),
                ),
              ),
              Container(
                width: 28,
                height: 2,
                color: _teal,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
