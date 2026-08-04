class Validators {
  Validators._();

  static final emailRegex = RegExp(r'^[\w.\-+]+@[\w.\-]+\.[A-Za-z]{2,}$');
  static final phoneRegex = RegExp(r'^[6-9]\d{9}$');
  static final emailOrPhoneRegex = RegExp(
    r'^([\w.\-+]+@[\w.\-]+\.[A-Za-z]{2,}|[6-9]\d{9})$',
  );

  static String normalizePhone(String value) {
    return value.replaceAll(RegExp(r'[\s\-+]'), '');
  }

  static String? required(String? value, [String label = 'This field']) {
    if (value == null || value.trim().isEmpty) return '$label is required';
    return null;
  }

  static String? name(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Name is required';
    if (v.length < 2) return 'Name must be at least 2 characters';
    if (v.length > 50) return 'Name must be under 50 characters';
    return null;
  }

  static String? email(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Email is required';
    if (!emailRegex.hasMatch(v)) return 'Enter a valid email';
    return null;
  }

  /// Returns last 10 digits for Indian numbers, or shorter string if incomplete.
  static String tenDigitPhone(String value) {
    final digits = normalizePhone(value.trim());
    if (digits.isEmpty) return '';
    if (digits.length == 10) return digits;
    if (digits.startsWith('91') && digits.length == 12) {
      return digits.substring(2);
    }
    if (digits.length > 10) {
      return digits.substring(digits.length - 10);
    }
    return digits;
  }

  static String? phone(String? value) {
    final digits = normalizePhone(value?.trim() ?? '');
    if (digits.isEmpty) return 'Mobile number is required';
    if (digits.length > 10 && !digits.startsWith('91')) {
      return 'Enter only 10 digits (without country code)';
    }
    final ten = tenDigitPhone(value ?? '');
    if (ten.length != 10) {
      return 'Mobile number must be exactly 10 digits';
    }
    if (!phoneRegex.hasMatch(ten)) {
      return 'Enter a valid Indian mobile number (starts with 6–9)';
    }
    return null;
  }

  static String? otp(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'OTP is required';
    if (!RegExp(r'^\d{6}$').hasMatch(v)) {
      return 'Enter the 6-digit OTP from SMS';
    }
    return null;
  }

  static String? emailOrPhone(String? value) {
    final raw = value?.trim() ?? '';
    if (raw.isEmpty) return 'Email or phone is required';
    if (raw.contains('@')) {
      return email(raw);
    }
    return phone(raw);
  }

  static String? password(String? value, {int min = 6}) {
    final v = value ?? '';
    if (v.isEmpty) return 'Password is required';
    if (v.length < min) return 'Password must be at least $min characters';
    return null;
  }

  static String? title(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Title is required';
    if (v.length < 3) return 'Title must be at least 3 characters';
    if (v.length > 100) return 'Title must be under 100 characters';
    return null;
  }

  static String? price(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Price is required';
    final n = num.tryParse(v);
    if (n == null) return 'Enter a valid price';
    if (n <= 0) return 'Price must be greater than 0';
    if (n > 100000000) return 'Price looks too high';
    return null;
  }

  static String? kmDriven(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'KM driven is required';
    final n = int.tryParse(v);
    if (n == null) return 'Enter a valid KM value';
    if (n < 0) return 'KM cannot be negative';
    if (n > 1000000) return 'KM looks too high';
    return null;
  }

  static String? year(String? value) {
    if (value == null || value.isEmpty) return 'Year of purchase is required';
    final n = int.tryParse(value);
    final now = DateTime.now().year;
    if (n == null) return 'Enter a valid year of purchase';
    if (n < 1980 || n > now) {
      return 'Year of purchase must be between 1980 and $now';
    }
    return null;
  }

  static String? requiredDropdown(String? value, String label) {
    if (value == null || value.isEmpty) return 'Select $label';
    return null;
  }

  static String? optionalMax(String? value, int max, [String label = 'Field']) {
    final v = value?.trim() ?? '';
    if (v.length > max) return '$label must be under $max characters';
    return null;
  }
}
