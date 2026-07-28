import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import '../../config/theme.dart';
import '../../providers/car_provider.dart';
import '../../utils/contact.dart';
import '../../utils/formatters.dart';

class CarDetailScreen extends ConsumerStatefulWidget {
  const CarDetailScreen({super.key, required this.carId});

  final String carId;

  @override
  ConsumerState<CarDetailScreen> createState() => _CarDetailScreenState();
}

class _CarDetailScreenState extends ConsumerState<CarDetailScreen> {
  int _activeImage = 0;

  @override
  Widget build(BuildContext context) {
    final carAsync = ref.watch(carDetailProvider(widget.carId));
    final favIds = ref.watch(favoriteIdsProvider);

    return carAsync.when(
      loading: () => const Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: CircularProgressIndicator(color: AppColors.gold)),
      ),
      error: (e, _) => Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          backgroundColor: Colors.white,
          foregroundColor: AppColors.charcoal,
        ),
        body: Center(child: Text('Failed to load car\n$e', textAlign: TextAlign.center)),
      ),
      data: (car) {
        final isFav = favIds.contains(car.id);
        final images = car.images;

        return Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            backgroundColor: Colors.white,
            foregroundColor: AppColors.charcoal,
            elevation: 0.4,
            title: Text(car.carKey.isNotEmpty ? car.carKey : 'Car Details'),
            actions: [
              IconButton(
                onPressed: () async {
                  try {
                    await toggleFavorite(ref, car.id);
                  } catch (_) {}
                },
                icon: Icon(
                  isFav ? Icons.favorite : Icons.favorite_border,
                  color: isFav ? Colors.red : AppColors.charcoal,
                ),
              ),
              IconButton(
                onPressed: () {
                  final text = '''
DT Car Bazaar listing

Car Key: ${car.carKey.isNotEmpty ? car.carKey : '-'}
${car.title}
${formatPrice(car.price)}
${car.year} • ${car.fuelType.name} • ${car.kmDriven} KM

Call/WhatsApp: +91 863 093 0402
'''.trim();
                  Share.share(text, subject: 'DT Car Bazaar - ${car.title}');
                },
                icon: const Icon(Icons.share_outlined),
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: AspectRatio(
                  aspectRatio: 16 / 10,
                  child: images.isEmpty
                      ? Container(
                          color: AppColors.softGray,
                          child: const Icon(Icons.directions_car, size: 72, color: AppColors.gold),
                        )
                      : CachedNetworkImage(
                          imageUrl: resolveImageUrl(images[_activeImage.clamp(0, images.length - 1)]),
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(
                            color: AppColors.softGray,
                            child: const Center(
                              child: CircularProgressIndicator(color: AppColors.gold),
                            ),
                          ),
                          errorWidget: (_, __, ___) => Container(
                            color: AppColors.softGray,
                            child: const Icon(Icons.broken_image, color: Colors.grey),
                          ),
                        ),
                ),
              ),
              if (images.length > 1) ...[
                const SizedBox(height: 10),
                SizedBox(
                  height: 68,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: images.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (_, i) {
                      final selected = i == _activeImage;
                      return GestureDetector(
                        onTap: () => setState(() => _activeImage = i),
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: selected ? AppColors.gold : AppColors.border,
                              width: selected ? 2 : 1,
                            ),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(7),
                            child: CachedNetworkImage(
                              imageUrl: resolveImageUrl(images[i]),
                              width: 92,
                              height: 68,
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
              const SizedBox(height: 16),
              Text(
                car.title,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
              ),
              if (car.carKey.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(
                  'Car Key: ${car.carKey}',
                  style: TextStyle(
                    color: Colors.grey.shade700,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
              const SizedBox(height: 6),
              Text(
                formatPrice(car.price),
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.goldDark,
                ),
              ),
              if (car.isCertified) ...[
                const SizedBox(height: 8),
                Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Certified',
                      style: TextStyle(
                        color: AppColors.goldDark,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _SpecIcon(Icons.calendar_today, '${car.year}'),
                  _SpecIcon(Icons.local_gas_station, car.fuelType.name),
                  _SpecIcon(Icons.speed, '${car.kmDriven} KM'),
                  _SpecIcon(Icons.settings, car.transmission),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                'Specifications',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              _SpecRow('Car Key', car.carKey.isEmpty ? '-' : car.carKey),
              _SpecRow('Brand', car.brand.name),
              _SpecRow('Model', car.model.name),
              _SpecRow('Year of Purchase', '${car.year}'),
              _SpecRow('KM Driven', '${car.kmDriven} KM'),
              _SpecRow('Fuel Type', car.fuelType.name),
              _SpecRow('Transmission', car.transmission),
              _SpecRow('Ownership', car.ownership),
              _SpecRow(
                'Insurance Validity',
                car.insuranceValidity.isEmpty ? '-' : car.insuranceValidity,
              ),
              _SpecRow('City', car.city.name),
              if (car.description.isNotEmpty) ...[
                const SizedBox(height: 16),
                const Text('Description', style: TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: 6),
                Text(car.description),
              ],
            ],
          ),
          bottomNavigationBar: SafeArea(
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: launchCall,
                      icon: const Icon(Icons.call),
                      label: const Text('Call'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size.fromHeight(48),
                        foregroundColor: AppColors.charcoal,
                        side: const BorderSide(color: AppColors.gold),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => launchWhatsApp(
                        message: buildCarWhatsAppMessage(car),
                      ),
                      icon: const Icon(Icons.chat),
                      label: const Text('WhatsApp Chat'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.gold,
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(48),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _SpecIcon extends StatelessWidget {
  const _SpecIcon(this.icon, this.label);

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: AppColors.goldDark, size: 22),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _SpecRow extends StatelessWidget {
  const _SpecRow(this.label, this.value);

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          Expanded(child: Text(label, style: TextStyle(color: Colors.grey.shade700))),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
