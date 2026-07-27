class NamedRef {
  NamedRef({required this.id, required this.name});

  final String id;
  final String name;

  factory NamedRef.fromJson(dynamic json) {
    if (json is Map<String, dynamic>) {
      return NamedRef(
        id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
        name: json['name']?.toString() ?? '',
      );
    }
    return NamedRef(id: json?.toString() ?? '', name: '');
  }
}

class CarModel {
  CarModel({
    required this.id,
    required this.carKey,
    required this.title,
    required this.brand,
    required this.model,
    required this.year,
    required this.price,
    required this.kmDriven,
    required this.fuelType,
    required this.transmission,
    required this.ownership,
    required this.insuranceValidity,
    required this.city,
    required this.description,
    required this.images,
    required this.status,
    required this.isCertified,
    this.rejectionReason = '',
  });

  final String id;
  final String carKey;
  final String title;
  final NamedRef brand;
  final NamedRef model;
  final int year;
  final double price;
  final int kmDriven;
  final NamedRef fuelType;
  final String transmission;
  final String ownership;
  final String insuranceValidity;
  final NamedRef city;
  final String description;
  final List<String> images;
  final String status;
  final bool isCertified;
  final String rejectionReason;

  String get primaryImage => images.isNotEmpty ? images.first : '';

  factory CarModel.fromJson(Map<String, dynamic> json) {
    return CarModel(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      carKey: json['carKey']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      brand: NamedRef.fromJson(json['brand']),
      model: NamedRef.fromJson(json['model']),
      year: _toInt(json['year']),
      price: _toDouble(json['price']),
      kmDriven: _toInt(json['kmDriven']),
      fuelType: NamedRef.fromJson(json['fuelType']),
      transmission: json['transmission']?.toString() ?? 'Manual',
      ownership: json['ownership']?.toString() ?? '',
      insuranceValidity: json['insuranceValidity']?.toString() ?? '',
      city: NamedRef.fromJson(json['city']),
      description: json['description']?.toString() ?? '',
      images: (json['images'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      status: json['status']?.toString() ?? 'pending',
      isCertified: json['isCertified'] == true,
      rejectionReason: json['rejectionReason']?.toString() ?? '',
    );
  }

  static int _toInt(dynamic v) => int.tryParse(v?.toString() ?? '') ?? 0;
  static double _toDouble(dynamic v) => double.tryParse(v?.toString() ?? '') ?? 0;
}

class MetaData {
  MetaData({
    required this.brands,
    required this.models,
    required this.cities,
    required this.fuelTypes,
    this.banners = const [],
  });

  final List<NamedRef> brands;
  final List<Map<String, dynamic>> models;
  final List<NamedRef> cities;
  final List<NamedRef> fuelTypes;
  final List<Map<String, dynamic>> banners;

  factory MetaData.fromJson(Map<String, dynamic> json) {
    return MetaData(
      brands: (json['brands'] as List? ?? [])
          .map((e) => NamedRef.fromJson(e))
          .toList(),
      models: (json['models'] as List? ?? [])
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList(),
      cities: (json['cities'] as List? ?? [])
          .map((e) => NamedRef.fromJson(e))
          .toList(),
      fuelTypes: (json['fuelTypes'] as List? ?? [])
          .map((e) => NamedRef.fromJson(e))
          .toList(),
      banners: (json['banners'] as List? ?? [])
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList(),
    );
  }

  List<NamedRef> modelsForBrand(String brandId) {
    return models
        .where((m) {
          final brand = m['brand'];
          final id = brand is Map ? brand['_id']?.toString() : brand?.toString();
          return id == brandId;
        })
        .map((m) => NamedRef.fromJson(m))
        .toList();
  }
}
