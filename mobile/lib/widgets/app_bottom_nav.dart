import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../config/theme.dart';
import '../utils/contact.dart';

class AppBottomNav extends StatelessWidget {
  const AppBottomNav({
    super.key,
    required this.current,
  });

  /// home | favorites | sell | profile
  final String current;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(4, 4, 4, 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              _navItem(
                context,
                icon: Icons.home_outlined,
                selectedIcon: Icons.home,
                label: 'Home',
                route: '/home',
                selected: current == 'home',
              ),
              _navItem(
                context,
                icon: Icons.favorite_border,
                selectedIcon: Icons.favorite,
                label: 'Wishlist',
                route: '/favorites',
                selected: current == 'favorites',
              ),
              _sellCenter(context),
              _whatsappItem(context),
              _navItem(
                context,
                icon: Icons.person_outline,
                selectedIcon: Icons.person,
                label: 'Profile',
                route: '/profile',
                selected: current == 'profile',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sellCenter(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: () => context.go('/sell'),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Transform.translate(
              offset: const Offset(0, -10),
              child: Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  gradient: AppGradients.primaryButton,
                  shape: BoxShape.circle,
                  boxShadow: AppShadows.primaryButton,
                ),
                child: const Icon(Icons.add, color: Colors.white, size: 30),
              ),
            ),
            const SizedBox(height: 2),
            Text(
              'Sell Car',
              style: TextStyle(
                fontSize: 11,
                fontWeight: current == 'sell' ? FontWeight.w700 : FontWeight.w600,
                color: current == 'sell' ? AppColors.tealDark : AppColors.teal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _whatsappItem(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: launchWhatsApp,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.chat, color: AppColors.whatsapp, size: 24),
            const SizedBox(height: 4),
            Text(
              'WhatsApp',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _navItem(
    BuildContext context, {
    required IconData icon,
    required IconData selectedIcon,
    required String label,
    required String route,
    required bool selected,
  }) {
    return Expanded(
      child: InkWell(
        onTap: () => context.go(route),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              selected ? selectedIcon : icon,
              color: selected ? AppColors.teal : AppColors.textSecondary,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? AppColors.teal : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
