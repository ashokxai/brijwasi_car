import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dt_car_bazaar/main.dart';

void main() {
  testWidgets('app boots', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: DtCarBazaarApp()));
    await tester.pump(const Duration(milliseconds: 100));
    expect(find.textContaining('DT'), findsWidgets);
  });
}
