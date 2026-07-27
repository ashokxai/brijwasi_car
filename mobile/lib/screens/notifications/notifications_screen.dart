import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../config/theme.dart';
import '../../providers/car_provider.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: AppColors.softGray,
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.charcoal,
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.gold)),
        error: (e, _) => Center(child: Text('Failed to load\n$e', textAlign: TextAlign.center)),
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text('No notifications'));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) {
              final n = items[i];
              final isRead = n['isRead'] == true;
              return ListTile(
                tileColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                leading: Icon(
                  Icons.notifications,
                  color: isRead ? Colors.grey : AppColors.gold,
                ),
                title: Text(
                  n['title']?.toString() ?? '',
                  style: TextStyle(fontWeight: isRead ? FontWeight.w500 : FontWeight.w700),
                ),
                subtitle: Text(n['message']?.toString() ?? ''),
                onTap: () async {
                  final id = n['_id']?.toString();
                  if (id != null && !isRead) {
                    await ref.read(carServiceProvider).markNotificationRead(id);
                    ref.invalidate(notificationsProvider);
                  }
                },
              );
            },
          );
        },
      ),
    );
  }
}
