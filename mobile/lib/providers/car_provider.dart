import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/car_model.dart';
import '../services/car_service.dart';
import 'auth_provider.dart';

final carServiceProvider = Provider<CarService>((ref) {
  return CarService(ref.watch(apiClientProvider));
});

final metaProvider = FutureProvider<MetaData>((ref) async {
  return ref.watch(carServiceProvider).getMeta();
});

class CarFilters {
  const CarFilters({
    this.search = '',
    this.brandId,
    this.fuelTypeId,
    this.year,
    this.minPrice,
    this.maxPrice,
  });

  final String search;
  final String? brandId;
  final String? fuelTypeId;
  final String? year;
  final String? minPrice;
  final String? maxPrice;

  CarFilters copyWith({
    String? search,
    String? brandId,
    String? fuelTypeId,
    String? year,
    String? minPrice,
    String? maxPrice,
    bool clearBrand = false,
    bool clearFuel = false,
    bool clearYear = false,
    bool clearPrice = false,
  }) {
    return CarFilters(
      search: search ?? this.search,
      brandId: clearBrand ? null : (brandId ?? this.brandId),
      fuelTypeId: clearFuel ? null : (fuelTypeId ?? this.fuelTypeId),
      year: clearYear ? null : (year ?? this.year),
      minPrice: clearPrice ? null : (minPrice ?? this.minPrice),
      maxPrice: clearPrice ? null : (maxPrice ?? this.maxPrice),
    );
  }
}

final carFiltersProvider = StateProvider<CarFilters>((ref) => const CarFilters());

final carsProvider = FutureProvider.autoDispose<List<CarModel>>((ref) async {
  final filters = ref.watch(carFiltersProvider);
  final result = await ref.watch(carServiceProvider).getCars(
        search: filters.search,
        brand: filters.brandId,
        fuelType: filters.fuelTypeId,
        year: filters.year,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      );
  return result.cars;
});

final carDetailProvider =
    FutureProvider.autoDispose.family<CarModel, String>((ref, id) async {
  return ref.watch(carServiceProvider).getCar(id);
});

final favoritesProvider =
    FutureProvider.autoDispose<List<CarModel>>((ref) async {
  ref.watch(authProvider);
  return ref.watch(carServiceProvider).getFavorites();
});

final favoriteIdsProvider = Provider.autoDispose<Set<String>>((ref) {
  final favs = ref.watch(favoritesProvider).valueOrNull ?? const [];
  return favs.map((e) => e.id).toSet();
});

final myCarsProvider = FutureProvider.autoDispose<List<CarModel>>((ref) async {
  ref.watch(authProvider);
  return ref.watch(carServiceProvider).getMyCars();
});

final notificationsProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  ref.watch(authProvider);
  return ref.watch(carServiceProvider).getNotifications();
});

Future<void> toggleFavorite(WidgetRef ref, String carId) async {
  final service = ref.read(carServiceProvider);
  final ids = ref.read(favoriteIdsProvider);
  if (ids.contains(carId)) {
    await service.removeFavorite(carId);
  } else {
    await service.addFavorite(carId);
  }
  ref.invalidate(favoritesProvider);
}
