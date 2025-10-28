import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

class LocationService extends ChangeNotifier {
  Position? _currentPosition;
  bool _isTracking = false;

  Position? get currentPosition => _currentPosition;
  bool get isTracking => _isTracking;

  /// Initialize location service
  Future<bool> initialize() async {
    final hasPermission = await _requestLocationPermission();
    if (!hasPermission) return false;

    await _getCurrentLocation();
    return true;
  }

  /// Request location permissions
  Future<bool> _requestLocationPermission() async {
    var status = await Permission.location.status;

    if (status.isDenied) {
      status = await Permission.location.request();
    }

    return status.isGranted;
  }

  /// Get current location
  Future<void> _getCurrentLocation() async {
    try {
      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      notifyListeners();
    } catch (e) {
      debugPrint('Error getting location: $e');
    }
  }

  /// Start tracking location
  Future<void> startTracking() async {
    if (_isTracking) return;

    _isTracking = true;
    notifyListeners();

    Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10, // Update every 10 meters
      ),
    ).listen((Position position) {
      _currentPosition = position;
      notifyListeners();
    });
  }

  /// Stop tracking location
  void stopTracking() {
    _isTracking = false;
    notifyListeners();
  }

  /// Calculate distance between two points
  double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2);
  }
}
