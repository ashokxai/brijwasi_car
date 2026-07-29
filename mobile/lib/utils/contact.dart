import 'package:url_launcher/url_launcher.dart';
import '../config/app_config.dart';
import '../models/car_model.dart';
import 'formatters.dart';

Future<void> launchCall() async {
  final uri = Uri.parse(AppConfig.callUrl);
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri);
  }
}

Future<void> launchWhatsApp({String? message}) async {
  final base = AppConfig.whatsappUrl;
  final uri = message == null || message.trim().isEmpty
      ? Uri.parse(base)
      : Uri.parse(base).replace(queryParameters: {'text': message});

  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

String buildCarWhatsAppMessage(CarModel car) {
  final key = car.carKey.isNotEmpty ? car.carKey : car.id;
  return '''
Hi Brijwasi Car Bazaar,

I am interested in this car:

Car Key: $key
Title: ${car.title}
Brand: ${car.brand.name}
Model: ${car.model.name}
Year of Purchase: ${car.year}
Price: ${formatPrice(car.price)}
KM Driven: ${car.kmDriven}
Fuel: ${car.fuelType.name}
Transmission: ${car.transmission}
City: ${car.city.name}

Please share more details.
'''.trim();
}
