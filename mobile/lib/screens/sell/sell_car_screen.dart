import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../config/theme.dart';
import '../../models/car_model.dart';
import '../../providers/car_provider.dart';
import '../../utils/validators.dart';
import '../../widgets/app_bottom_nav.dart';
import '../../widgets/app_button.dart';

class SellCarScreen extends ConsumerStatefulWidget {
  const SellCarScreen({super.key});

  @override
  ConsumerState<SellCarScreen> createState() => _SellCarScreenState();
}

class _SellCarScreenState extends ConsumerState<SellCarScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _kmCtrl = TextEditingController();
  final _insuranceCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _picker = ImagePicker();

  String? _brandId;
  String? _modelId;
  String? _fuelId;
  String? _cityId;
  String? _year;
  String _transmission = 'Manual';
  String _ownership = 'First Owner';
  bool _loading = false;
  final List<XFile> _photos = [];
  final List<Uint8List> _photoBytes = [];

  @override
  void dispose() {
    _titleCtrl.dispose();
    _priceCtrl.dispose();
    _kmCtrl.dispose();
    _insuranceCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _showPhotoSourceSheet() async {
    if (_photos.length >= 10) return;
    await showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Add car photo',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                ),
                ListTile(
                  leading: const Icon(Icons.photo_camera, color: AppColors.gold),
                  title: const Text('Take photo (Camera)'),
                  onTap: () {
                    Navigator.pop(ctx);
                    _pickFromCamera();
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.photo_library, color: AppColors.gold),
                  title: const Text('Choose from Gallery'),
                  onTap: () {
                    Navigator.pop(ctx);
                    _pickFromGallery();
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _addPhotoFiles(List<XFile> files) async {
    if (files.isEmpty) return;
    final remaining = 10 - _photos.length;
    final selected = files.take(remaining).toList();
    final bytes = <Uint8List>[];
    for (final f in selected) {
      bytes.add(await f.readAsBytes());
    }
    if (!mounted) return;
    setState(() {
      _photos.addAll(selected);
      _photoBytes.addAll(bytes);
    });
  }

  Future<void> _pickFromCamera() async {
    if (_photos.length >= 10) return;
    try {
      final file = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
        preferredCameraDevice: CameraDevice.rear,
      );
      if (file == null) return;
      await _addPhotoFiles([file]);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Camera unavailable: $e')),
      );
    }
  }

  Future<void> _pickFromGallery() async {
    if (_photos.length >= 10) return;
    try {
      final files = await _picker.pickMultiImage(imageQuality: 80);
      await _addPhotoFiles(files);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gallery unavailable: $e')),
      );
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fix the highlighted fields')),
      );
      return;
    }
    if (_photos.length < 3) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Upload at least 3 photos (max 10)')),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      final formData = FormData();
      formData.fields.addAll([
        MapEntry('title', _titleCtrl.text.trim()),
        MapEntry('brand', _brandId!),
        MapEntry('model', _modelId!),
        MapEntry('year', _year!),
        MapEntry('price', _priceCtrl.text.trim()),
        MapEntry('kmDriven', _kmCtrl.text.trim()),
        MapEntry('fuelType', _fuelId!),
        MapEntry('city', _cityId!),
        MapEntry('transmission', _transmission),
        MapEntry('ownership', _ownership),
        MapEntry('insuranceValidity', _insuranceCtrl.text.trim()),
        MapEntry('description', _descCtrl.text.trim()),
      ]);

      for (var i = 0; i < _photos.length; i++) {
        final bytes = _photoBytes[i];
        final name = _photos[i].name.isNotEmpty ? _photos[i].name : 'car_$i.jpg';
        formData.files.add(
          MapEntry(
            'images',
            MultipartFile.fromBytes(bytes, filename: name),
          ),
        );
      }

      final created = await ref.read(carServiceProvider).createCar(formData: formData);
      ref.invalidate(myCarsProvider);
      ref.invalidate(notificationsProvider);

      if (!mounted) return;
      await showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle, color: AppColors.success, size: 64),
              const SizedBox(height: 12),
              const Text(
                'Submission Successful!',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              if (created.carKey.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  'Car Key: ${created.carKey}',
                  style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.goldDark),
                ),
              ],
              const SizedBox(height: 10),
              Text(
                'Your details for DT Car Bazaar have been submitted successfully. Our team will review the specifications and car images (${_photos.length} uploaded). A representative will contact you within 24 hours for verification and listing approval.',
                textAlign: TextAlign.center,
              ),
            ],
          ),
          actions: [
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(ctx);
                  context.go('/home');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.gold,
                  foregroundColor: Colors.white,
                ),
                child: const Text('OK'),
              ),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      String message = 'Submission failed';
      try {
        message = (e as dynamic).response?.data?['message']?.toString() ?? message;
      } catch (_) {}
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final metaAsync = ref.watch(metaProvider);
    final models = (_brandId == null || metaAsync.valueOrNull == null)
        ? <NamedRef>[]
        : metaAsync.valueOrNull!.modelsForBrand(_brandId!);

    return Scaffold(
      backgroundColor: AppColors.softGray,
      appBar: AppBar(
        title: const Text('Sell Your Car - Enter Details'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.charcoal,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home'),
        ),
      ),
      body: metaAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold)),
        error: (e, _) => Center(child: Text('Failed to load form data\n$e')),
        data: (meta) {
          return Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              children: [
                const Text(
                  'UPLOAD CAR PHOTOS (Min 3 Max 10)',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ...List.generate(_photos.length, (i) {
                      return Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.memory(
                              _photoBytes[i],
                              width: 84,
                              height: 84,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            right: 0,
                            top: 0,
                            child: GestureDetector(
                              onTap: () => setState(() {
                                _photos.removeAt(i);
                                _photoBytes.removeAt(i);
                              }),
                              child: const CircleAvatar(
                                radius: 12,
                                backgroundColor: Colors.black54,
                                child: Icon(Icons.close, size: 14, color: Colors.white),
                              ),
                            ),
                          ),
                        ],
                      );
                    }),
                    if (_photos.length < 10)
                      InkWell(
                        onTap: _showPhotoSourceSheet,
                        child: Container(
                          width: 84,
                          height: 84,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: const Icon(Icons.add, color: AppColors.gold, size: 32),
                        ),
                      ),
                  ],
                ),
                if (_photos.length < 10) ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _pickFromCamera,
                          icon: const Icon(Icons.photo_camera),
                          label: const Text('Camera'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.charcoal,
                            side: const BorderSide(color: AppColors.gold),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _pickFromGallery,
                          icon: const Icon(Icons.photo_library),
                          label: const Text('Gallery'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppColors.charcoal,
                            side: const BorderSide(color: AppColors.border),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 18),
                TextFormField(
                  controller: _titleCtrl,
                  decoration: const InputDecoration(labelText: 'Title (e.g. Swift VDI)', filled: true, fillColor: Colors.white),
                  validator: Validators.title,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _brandId,
                  decoration: const InputDecoration(labelText: 'Brand', filled: true, fillColor: Colors.white),
                  items: meta.brands
                      .map((b) => DropdownMenuItem(value: b.id, child: Text(b.name)))
                      .toList(),
                  validator: (v) => Validators.requiredDropdown(v, 'brand'),
                  onChanged: (v) => setState(() {
                    _brandId = v;
                    _modelId = null;
                  }),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _modelId,
                  decoration: const InputDecoration(labelText: 'Model', filled: true, fillColor: Colors.white),
                  items: models
                      .map((m) => DropdownMenuItem(value: m.id, child: Text(m.name)))
                      .toList(),
                  validator: (v) => Validators.requiredDropdown(v, 'model'),
                  onChanged: (v) => setState(() => _modelId = v),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _year,
                  decoration: const InputDecoration(labelText: 'Year of Manufacture', filled: true, fillColor: Colors.white),
                  items: List.generate(25, (i) {
                    final y = (DateTime.now().year - i).toString();
                    return DropdownMenuItem(value: y, child: Text(y));
                  }),
                  validator: Validators.year,
                  onChanged: (v) => setState(() => _year = v),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _priceCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Expected Price (₹)', filled: true, fillColor: Colors.white),
                  validator: Validators.price,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _kmCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'KM Driven', filled: true, fillColor: Colors.white),
                  validator: Validators.kmDriven,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _fuelId,
                  decoration: const InputDecoration(labelText: 'Fuel Type', filled: true, fillColor: Colors.white),
                  items: meta.fuelTypes
                      .map((f) => DropdownMenuItem(value: f.id, child: Text(f.name)))
                      .toList(),
                  validator: (v) => Validators.requiredDropdown(v, 'fuel type'),
                  onChanged: (v) => setState(() => _fuelId = v),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _transmission,
                  decoration: const InputDecoration(labelText: 'Transmission', filled: true, fillColor: Colors.white),
                  items: const [
                    DropdownMenuItem(value: 'Manual', child: Text('Manual')),
                    DropdownMenuItem(value: 'Automatic', child: Text('Automatic')),
                  ],
                  validator: (v) => Validators.requiredDropdown(v, 'transmission'),
                  onChanged: (v) => setState(() => _transmission = v ?? 'Manual'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _ownership,
                  decoration: const InputDecoration(labelText: 'Ownership', filled: true, fillColor: Colors.white),
                  items: const [
                    DropdownMenuItem(value: 'First Owner', child: Text('First Owner')),
                    DropdownMenuItem(value: 'Second Owner', child: Text('Second Owner')),
                    DropdownMenuItem(value: 'Third Owner', child: Text('Third Owner')),
                    DropdownMenuItem(value: 'Fourth Owner or more', child: Text('Fourth Owner or more')),
                  ],
                  validator: (v) => Validators.requiredDropdown(v, 'ownership'),
                  onChanged: (v) => setState(() => _ownership = v ?? 'First Owner'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _cityId,
                  decoration: const InputDecoration(labelText: 'City', filled: true, fillColor: Colors.white),
                  items: meta.cities
                      .map((c) => DropdownMenuItem(value: c.id, child: Text(c.name)))
                      .toList(),
                  validator: (v) => Validators.requiredDropdown(v, 'city'),
                  onChanged: (v) => setState(() => _cityId = v),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _insuranceCtrl,
                  decoration: const InputDecoration(labelText: 'Insurance Validity (optional)', filled: true, fillColor: Colors.white),
                  validator: (v) => Validators.optionalMax(v, 40, 'Insurance'),
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _descCtrl,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Description (optional)', filled: true, fillColor: Colors.white),
                  validator: (v) => Validators.optionalMax(v, 1000, 'Description'),
                ),
                const SizedBox(height: 20),
                AppButton(
                  label: 'SUBMIT DETAILS',
                  loading: _loading,
                  onPressed: _submit,
                ),
                if (kIsWeb)
                  const Padding(
                    padding: EdgeInsets.only(top: 8),
                    child: Text(
                      'Tip: photo picker works in Chrome; use a device/emulator for camera.',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                      textAlign: TextAlign.center,
                    ),
                  ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: const AppBottomNav(current: 'sell'),
    );
  }
}
