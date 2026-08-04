import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/auth/complete_profile_screen.dart';
import '../screens/auth/email_login_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/car/car_detail_screen.dart';
import '../screens/favorites/favorites_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../screens/sell/sell_car_screen.dart';
import '../providers/splash_provider.dart';
import '../screens/splash/splash_screen.dart';
import '../widgets/app_bottom_nav.dart';
import '../config/theme.dart';
import '../providers/car_provider.dart';
import '../widgets/car_list_card.dart';

class _RouterRefresh extends ChangeNotifier {
  _RouterRefresh(Ref ref) {
    _sub = ref.listen<AuthState>(authProvider, (_, __) => notifyListeners());
    ref.listen<bool>(splashPresentationCompleteProvider, (_, __) => notifyListeners());
  }

  late final ProviderSubscription<AuthState> _sub;

  @override
  void dispose() {
    _sub.close();
    super.dispose();
  }
}

final routerProvider = Provider<GoRouter>((ref) {
  final refresh = _RouterRefresh(ref);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: refresh,
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/login/email', builder: (_, __) => const EmailLoginScreen()),
      GoRoute(path: '/complete-profile', builder: (_, __) => const CompleteProfileScreen()),
      GoRoute(
        path: '/register',
        redirect: (_, __) => '/login',
      ),
      GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordScreen()),
      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
      GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      GoRoute(path: '/sell', builder: (_, __) => const SellCarScreen()),
      GoRoute(path: '/favorites', builder: (_, __) => const FavoritesScreen()),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
      GoRoute(
        path: '/cars/:id',
        builder: (_, state) => CarDetailScreen(carId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/my-cars',
        builder: (_, __) => const MyCarsScreen(),
      ),
    ],
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      final loc = state.matchedLocation;
      final loggingIn = loc == '/login' ||
          loc == '/login/email' ||
          loc == '/complete-profile' ||
          loc == '/forgot-password' ||
          loc == '/register';
      final onSplash = loc == '/splash';
      final splashDone = ref.read(splashPresentationCompleteProvider);

      // Keep user on auth screens while login/register is in progress.
      if (auth.isLoading && loggingIn) return null;

      if (onSplash && !splashDone) return null;

      // Initial session check only.
      if (auth.isLoading) {
        return onSplash ? null : '/splash';
      }

      if (!auth.isAuthenticated) {
        if (loggingIn) return null;
        return '/login';
      }

      if (loggingIn || onSplash) return '/home';
      return null;
    },
  );
});

class MyCarsScreen extends ConsumerWidget {
  const MyCarsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(myCarsProvider);
    return Scaffold(
      backgroundColor: AppColors.softGray,
      appBar: AppBar(
        title: const Text('My Listings'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.charcoal,
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold)),
        error: (e, _) => Center(child: Text('$e')),
        data: (cars) {
          if (cars.isEmpty) return const Center(child: Text('No listings yet'));
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: cars.length,
            itemBuilder: (_, i) {
              final car = cars[i];
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CarListCard(
                    car: car,
                    onTap: () => context.push('/cars/${car.id}'),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 8, bottom: 12),
                    child: Text(
                      'Status: ${car.status}',
                      style: TextStyle(
                        color: car.status == 'approved'
                            ? AppColors.success
                            : car.status == 'rejected'
                                ? Colors.red
                                : AppColors.goldDark,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              );
            },
          );
        },
      ),
      bottomNavigationBar: const AppBottomNav(current: 'profile'),
    );
  }
}
