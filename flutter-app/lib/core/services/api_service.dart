import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';

class ApiService extends ChangeNotifier {
  late final Dio _dio;
  static const String baseUrl = 'http://localhost:5000/api';

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    // Add interceptors
    _dio.interceptors.add(LogInterceptor(
      requestBody: true,
      responseBody: true,
    ));
  }

  /// Get nearby coupons
  Future<List<dynamic>> getCouponsNearby(double lat, double lng, {int radius = 1000}) async {
    try {
      final response = await _dio.get('/coupons/nearby', queryParameters: {
        'lat': lat,
        'lng': lng,
        'radius': radius,
      });

      return response.data['coupons'] as List<dynamic>;
    } catch (e) {
      debugPrint('Error fetching nearby coupons: $e');
      return [];
    }
  }

  /// Catch a coupon
  Future<Map<String, dynamic>?> catchCoupon(String couponId, String userId, double lat, double lng) async {
    try {
      final response = await _dio.post('/coupons/$couponId/catch', data: {
        'userId': userId,
        'userLat': lat,
        'userLng': lng,
      });

      return response.data as Map<String, dynamic>;
    } catch (e) {
      debugPrint('Error catching coupon: $e');
      return null;
    }
  }

  /// Use a coupon
  Future<Map<String, dynamic>?> useCoupon(String couponId, String userId) async {
    try {
      final response = await _dio.post('/coupons/$couponId/use', data: {
        'userId': userId,
      });

      return response.data as Map<String, dynamic>;
    } catch (e) {
      debugPrint('Error using coupon: $e');
      return null;
    }
  }

  /// Get user's coupons
  Future<List<dynamic>> getUserCoupons(String userId, {bool active = true}) async {
    try {
      final response = await _dio.get('/coupons/user/$userId', queryParameters: {
        'active': active.toString(),
      });

      return response.data['coupons'] as List<dynamic>;
    } catch (e) {
      debugPrint('Error fetching user coupons: $e');
      return [];
    }
  }

  /// Register user
  Future<Map<String, dynamic>?> registerUser(String username, String email, String password) async {
    try {
      final response = await _dio.post('/users/register', data: {
        'username': username,
        'email': email,
        'password': password,
      });

      return response.data as Map<String, dynamic>;
    } catch (e) {
      debugPrint('Error registering user: $e');
      return null;
    }
  }

  /// Login user
  Future<Map<String, dynamic>?> loginUser(String email, String password) async {
    try {
      final response = await _dio.post('/users/login', data: {
        'email': email,
        'password': password,
      });

      return response.data as Map<String, dynamic>;
    } catch (e) {
      debugPrint('Error logging in: $e');
      return null;
    }
  }
}
