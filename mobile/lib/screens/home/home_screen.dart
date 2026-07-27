import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/app_config.dart';
import '../../config/theme.dart';
import '../../providers/car_provider.dart';
import '../../widgets/app_bottom_nav.dart';
import '../../widgets/car_list_card.dart';
import '../../widgets/home_banner_carousel.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickFilter({
    required String title,
    required List<({String? id, String label})> options,
    required void Function(String? id) onSelect,
  }) async {
    final selected = await showModalBottomSheet<String?>(
      context: context,
      builder: (ctx) {
        return SafeArea(
          child: ListView(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
              ),
              ...options.map(
                (o) => ListTile(
                  title: Text(o.label),
                  onTap: () => Navigator.pop(ctx, o.id ?? '__clear__'),
                ),
              ),
            ],
          ),
        );
      },
    );
    if (selected == null) return;
    onSelect(selected == '__clear__' ? null : selected);
  }

  @override
  Widget build(BuildContext context) {
    final carsAsync = ref.watch(carsProvider);
    final metaAsync = ref.watch(metaProvider);
    final favIds = ref.watch(favoriteIdsProvider);
    final filters = ref.watch(carFiltersProvider);

    return Scaffold(
      backgroundColor: AppColors.softGray,
      appBar: AppBar(
        title: const Text(AppConfig.appName),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.charcoal,
        elevation: 0.4,
        actions: [
          IconButton(
            onPressed: () => context.push('/notifications'),
            icon: const Icon(Icons.notifications_none),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(carsProvider);
          ref.invalidate(metaProvider);
          ref.invalidate(favoritesProvider);
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          children: [
            TextField(
              controller: _searchCtrl,
              onSubmitted: (v) {
                ref.read(carFiltersProvider.notifier).state =
                    filters.copyWith(search: v.trim());
              },
              decoration: InputDecoration(
                hintText: 'Search cars...',
                filled: true,
                fillColor: Colors.white,
                prefixIcon: const Icon(Icons.search),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.arrow_forward),
                  onPressed: () {
                    ref.read(carFiltersProvider.notifier).state =
                        filters.copyWith(search: _searchCtrl.text.trim());
                  },
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
              ),
            ),
            const SizedBox(height: 12),
            metaAsync.when(
              data: (meta) => HomeBannerCarousel(banners: meta.banners),
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const SizedBox(height: 12),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _FilterChipButton(
                    label: 'Price Range',
                    active: filters.minPrice != null || filters.maxPrice != null,
                    onTap: () async {
                      final result = await showDialog<({String? min, String? max})>(
                        context: context,
                        builder: (ctx) {
                          final minCtrl = TextEditingController(text: filters.minPrice);
                          final maxCtrl = TextEditingController(text: filters.maxPrice);
                          return AlertDialog(
                            title: const Text('Price Range'),
                            content: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                TextField(controller: minCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Min ₹')),
                                TextField(controller: maxCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Max ₹')),
                              ],
                            ),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(ctx, (min: null, max: null)), child: const Text('Clear')),
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, (min: minCtrl.text.trim(), max: maxCtrl.text.trim())),
                                child: const Text('Apply'),
                              ),
                            ],
                          );
                        },
                      );
                      if (result == null) return;
                      ref.read(carFiltersProvider.notifier).state = CarFilters(
                        search: filters.search,
                        brandId: filters.brandId,
                        fuelTypeId: filters.fuelTypeId,
                        year: filters.year,
                        minPrice: (result.min == null || result.min!.isEmpty) ? null : result.min,
                        maxPrice: (result.max == null || result.max!.isEmpty) ? null : result.max,
                      );
                    },
                  ),
                  _FilterChipButton(
                    label: 'Brand',
                    active: filters.brandId != null,
                    onTap: () {
                      final brands = metaAsync.valueOrNull?.brands ?? [];
                      _pickFilter(
                        title: 'Brand',
                        options: [
                          (id: null, label: 'All Brands'),
                          ...brands.map((b) => (id: b.id, label: b.name)),
                        ],
                        onSelect: (id) {
                          ref.read(carFiltersProvider.notifier).state = id == null
                              ? filters.copyWith(clearBrand: true)
                              : filters.copyWith(brandId: id);
                        },
                      );
                    },
                  ),
                  _FilterChipButton(
                    label: 'Fuel Type',
                    active: filters.fuelTypeId != null,
                    onTap: () {
                      final fuels = metaAsync.valueOrNull?.fuelTypes ?? [];
                      _pickFilter(
                        title: 'Fuel Type',
                        options: [
                          (id: null, label: 'All Fuels'),
                          ...fuels.map((f) => (id: f.id, label: f.name)),
                        ],
                        onSelect: (id) {
                          ref.read(carFiltersProvider.notifier).state = id == null
                              ? filters.copyWith(clearFuel: true)
                              : filters.copyWith(fuelTypeId: id);
                        },
                      );
                    },
                  ),
                  _FilterChipButton(
                    label: 'Year',
                    active: filters.year != null,
                    onTap: () {
                      final years = List.generate(20, (i) => (DateTime.now().year - i).toString());
                      _pickFilter(
                        title: 'Year',
                        options: [
                          (id: null, label: 'All Years'),
                          ...years.map((y) => (id: y, label: y)),
                        ],
                        onSelect: (id) {
                          ref.read(carFiltersProvider.notifier).state = id == null
                              ? filters.copyWith(clearYear: true)
                              : filters.copyWith(year: id);
                        },
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            carsAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.only(top: 48),
                child: Center(child: CircularProgressIndicator(color: AppColors.gold)),
              ),
              error: (e, _) => Padding(
                padding: const EdgeInsets.only(top: 32),
                child: Column(
                  children: [
                    Text('Could not load cars.\n$e', textAlign: TextAlign.center),
                    const SizedBox(height: 12),
                    TextButton(
                      onPressed: () => ref.invalidate(carsProvider),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
              data: (cars) {
                if (cars.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.only(top: 48),
                    child: Center(child: Text('No cars found')),
                  );
                }
                return Column(
                  children: cars.map((car) {
                    final isFav = favIds.contains(car.id);
                    return CarListCard(
                      car: car,
                      isFavorite: isFav,
                      onTap: () => context.push('/cars/${car.id}'),
                      onFavorite: () async {
                        try {
                          await toggleFavorite(ref, car.id);
                        } catch (e) {
                          if (!mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Favorite failed: $e')),
                          );
                        }
                      },
                    );
                  }).toList(),
                );
              },
            ),
          ],
        ),
      ),
      bottomNavigationBar: const AppBottomNav(current: 'home'),
    );
  }
}

class _FilterChipButton extends StatelessWidget {
  const _FilterChipButton({
    required this.label,
    required this.onTap,
    this.active = false,
  });

  final String label;
  final VoidCallback onTap;
  final bool active;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          backgroundColor: active ? AppColors.gold.withValues(alpha: 0.15) : Colors.white,
          foregroundColor: AppColors.charcoal,
          side: BorderSide(color: active ? AppColors.gold : AppColors.border),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
        child: Text(label),
      ),
    );
  }
}
