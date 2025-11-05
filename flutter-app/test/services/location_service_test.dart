import 'package:flutter_test/flutter_test.dart';
import 'package:kupongo/core/services/location_service.dart';
import 'package:geolocator/geolocator.dart';

void main() {
  group('LocationService Tests', () {
    late LocationService locationService;

    setUp(() {
      locationService = LocationService();
    });

    test('should calculate distance between two coordinates', () {
      final distance = locationService.calculateDistance(
        55.7558, // Moscow
        37.6173,
        55.7522, // Nearby point
        37.6156,
      );

      expect(distance, greaterThan(0));
      expect(distance, lessThan(1000)); // Less than 1km
    });

    test('should format distance correctly', () {
      expect(locationService.formatDistance(500), '500 м');
      expect(locationService.formatDistance(1500), '1.5 км');
      expect(locationService.formatDistance(2300), '2.3 км');
    });

    test('should check if location is within radius', () {
      final isNearby = locationService.isWithinRadius(
        55.7558,
        37.6173,
        55.7560,
        37.6175,
        100, // 100 meters
      );

      expect(isNearby, isTrue);
    });

    test('should check if location is outside radius', () {
      final isNearby = locationService.isWithinRadius(
        55.7558,
        37.6173,
        55.8000,
        37.7000,
        100, // 100 meters
      );

      expect(isNearby, isFalse);
    });
  });
}
