import 'package:dio/dio.dart';
import '../models/car_model.dart';
import 'api_client.dart';

class CarService {
  CarService(this._api);

  final ApiClient _api;

  Future<({List<CarModel> cars, int total})> getCars({
    String? search,
    String? brand,
    String? fuelType,
    String? year,
    String? minPrice,
    String? maxPrice,
    int page = 1,
  }) async {
    final res = await _api.dio.get(
      '/cars',
      queryParameters: {
        'page': page,
        'limit': 30,
        if (search != null && search.isNotEmpty) 'search': search,
        if (brand != null && brand.isNotEmpty) 'brand': brand,
        if (fuelType != null && fuelType.isNotEmpty) 'fuelType': fuelType,
        if (year != null && year.isNotEmpty) 'year': year,
        if (minPrice != null && minPrice.isNotEmpty) 'minPrice': minPrice,
        if (maxPrice != null && maxPrice.isNotEmpty) 'maxPrice': maxPrice,
      },
    );
    final list = (res.data['data'] as List? ?? [])
        .map((e) => CarModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    final total = res.data['pagination']?['total'] as int? ?? list.length;
    return (cars: list, total: total);
  }

  Future<CarModel> getCar(String id) async {
    final res = await _api.dio.get('/cars/$id');
    return CarModel.fromJson(Map<String, dynamic>.from(res.data['data'] as Map));
  }

  Future<List<CarModel>> getMyCars() async {
    final res = await _api.dio.get('/cars/my-cars');
    return (res.data['data'] as List? ?? [])
        .map((e) => CarModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<List<CarModel>> getFavorites() async {
    final res = await _api.dio.get('/cars/favorites');
    return (res.data['data'] as List? ?? [])
        .map((e) => CarModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<void> addFavorite(String carId) async {
    await _api.dio.post('/cars/favorite', data: {'carId': carId});
  }

  Future<void> removeFavorite(String carId) async {
    await _api.dio.delete('/cars/favorite', data: {'carId': carId});
  }

  Future<CarModel> createCar({
    required FormData formData,
  }) async {
    final res = await _api.dio.post(
      '/cars',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );
    return CarModel.fromJson(Map<String, dynamic>.from(res.data['data'] as Map));
  }

  Future<MetaData> getMeta() async {
    final res = await _api.dio.get('/meta');
    return MetaData.fromJson(Map<String, dynamic>.from(res.data['data'] as Map));
  }

  Future<List<Map<String, dynamic>>> getNotifications() async {
    final res = await _api.dio.get('/notifications');
    return (res.data['data'] as List? ?? [])
        .map((e) => Map<String, dynamic>.from(e as Map))
        .toList();
  }

  Future<void> markNotificationRead(String id) async {
    await _api.dio.patch('/notifications/$id/read');
  }
}
