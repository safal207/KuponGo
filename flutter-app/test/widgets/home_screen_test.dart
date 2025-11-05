import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kupongo/features/home/home_screen.dart';

void main() {
  group('HomeScreen Widget Tests', () {
    testWidgets('should display app bar with title', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: HomeScreen(),
        ),
      );

      expect(find.text('KuponGo'), findsOneWidget);
    });

    testWidgets('should have nearby coupons section', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: HomeScreen(),
        ),
      );

      expect(find.text('Купоны рядом'), findsOneWidget);
    });

    testWidgets('should display floating action button for AR mode', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: HomeScreen(),
        ),
      );

      expect(find.byType(FloatingActionButton), findsOneWidget);
    });

    testWidgets('should navigate to AR camera on FAB tap', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: HomeScreen(),
          routes: {
            '/ar-camera': (context) => Scaffold(body: Text('AR Camera')),
          },
        ),
      );

      await tester.tap(find.byType(FloatingActionButton));
      await tester.pumpAndSettle();

      expect(find.text('AR Camera'), findsOneWidget);
    });

    testWidgets('should show bottom navigation bar', (WidgetTester tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: HomeScreen(),
        ),
      );

      expect(find.byType(BottomNavigationBar), findsOneWidget);
      expect(find.byIcon(Icons.home), findsOneWidget);
      expect(find.byIcon(Icons.map), findsOneWidget);
      expect(find.byIcon(Icons.inventory), findsOneWidget);
      expect(find.byIcon(Icons.person), findsOneWidget);
    });
  });
}
