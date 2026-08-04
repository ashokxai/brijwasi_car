import 'dart:math' as math;

import 'package:flutter/material.dart';

/// Front-view car asset with subtle headlight glow (premium, not flashy).
class AnimatedCarHeadlights extends StatefulWidget {
  const AnimatedCarHeadlights({
    super.key,
    this.height = 120,
  });

  final double height;

  @override
  State<AnimatedCarHeadlights> createState() => _AnimatedCarHeadlightsState();
}

class _AnimatedCarHeadlightsState extends State<AnimatedCarHeadlights>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final carWidth = widget.height * (456 / 274);

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = Curves.easeInOut.transform(_controller.value);
        final glow = 0.35 + 0.45 * math.sin(t * math.pi);

        return SizedBox(
          width: carWidth,
          height: widget.height,
          child: Stack(
            clipBehavior: Clip.hardEdge,
            alignment: Alignment.center,
            children: [
              _HeadlightGlow(
                left: carWidth * 0.18,
                top: widget.height * 0.36,
                size: widget.height * 0.14,
                opacity: glow * 0.55,
              ),
              _HeadlightGlow(
                left: carWidth * 0.62,
                top: widget.height * 0.36,
                size: widget.height * 0.14,
                opacity: glow * 0.55,
              ),
              child!,
            ],
          ),
        );
      },
      child: Image.asset(
        'assets/images/logo_car.png',
        height: widget.height,
        width: carWidth,
        fit: BoxFit.fitWidth,
        alignment: Alignment.centerLeft,
        filterQuality: FilterQuality.high,
      ),
    );
  }
}

class _HeadlightGlow extends StatelessWidget {
  const _HeadlightGlow({
    required this.left,
    required this.top,
    required this.size,
    required this.opacity,
  });

  final double left;
  final double top;
  final double size;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: left,
      top: top,
      child: IgnorePointer(
        child: Container(
          width: size,
          height: size * 0.72,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(size),
            boxShadow: [
              BoxShadow(
                color: Colors.white.withValues(alpha: opacity),
                blurRadius: size * 0.9,
                spreadRadius: size * 0.15,
              ),
              BoxShadow(
                color: const Color(0xFF17B6A6).withValues(alpha: opacity * 0.35),
                blurRadius: size * 0.5,
                spreadRadius: size * 0.05,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
