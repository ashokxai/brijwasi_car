import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/car_provider.dart';
import '../../widgets/app_bottom_nav.dart';
import '../../widgets/car_list_card.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favsAsync = ref.watch(favoritesProvider);

    return Scaffold(
      backgroundColor: AppColors.softGray,
      appBar: AppBar(
        title: const Text('Favorites'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.charcoal,
      ),
      body: favsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold)),
        error: (e, _) => Center(child: Text('Failed to load favorites\n$e', textAlign: TextAlign.center)),
        data: (cars) {
          if (cars.isEmpty) {
            return const Center(child: Text('No favorites yet'));
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(favoritesProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: cars.length,
              itemBuilder: (_, i) {
                final car = cars[i];
                return CarListCard(
                  car: car,
                  isFavorite: true,
                  onTap: () => context.push('/cars/${car.id}'),
                  onFavorite: () => toggleFavorite(ref, car.id),
                );
              },
            ),
          );
        },
      ),
      bottomNavigationBar: const AppBottomNav(current: 'favorites'),
    );
  }
}
