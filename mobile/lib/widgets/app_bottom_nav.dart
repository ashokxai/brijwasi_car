import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../config/theme.dart';
import '../utils/contact.dart';

class AppBottomNav extends StatelessWidget {
  const AppBottomNav({super.key, required this.current});

  /// home | favorites | sell | profile
  final String current;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(8, 8, 8, 10),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: Row(
          children: [
            _navItem(context, Icons.call, 'Call', null, onTap: launchCall),
            _navItem(
              context,
              Icons.chat,
              'WhatsApp',
              null,
              onTap: launchWhatsApp,
            ),
            Expanded(
              child: GestureDetector(
                onTap: () => context.go('/sell'),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: const BoxDecoration(
                        color: AppColors.gold,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.add, color: Colors.white, size: 28),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Sell',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: current == 'sell' ? FontWeight.w700 : FontWeight.w500,
                        color: current == 'sell' ? AppColors.goldDark : Colors.grey.shade700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            _navItem(
              context,
              Icons.favorite_border,
              'Favorites',
              '/favorites',
              selected: current == 'favorites',
            ),
            _navItem(
              context,
              Icons.person_outline,
              'Profile',
              '/profile',
              selected: current == 'profile',
            ),
          ],
        ),
      ),
    );
  }

  Widget _navItem(
    BuildContext context,
    IconData icon,
    String label,
    String? route, {
    bool selected = false,
    VoidCallback? onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap ?? (route != null ? () => context.go(route) : null),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: selected ? AppColors.goldDark : Colors.grey.shade700),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? AppColors.goldDark : Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
