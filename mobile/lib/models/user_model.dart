class UserModel {
  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.favorites = const [],
  });

  final String id;
  final String name;
  final String email;
  final String phone;
  final String role;
  final List<String> favorites;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'customer',
      favorites: (json['favorites'] as List?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
    );
  }
}
