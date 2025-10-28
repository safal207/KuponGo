import 'package:get_it/get_it.dart';
import 'location_service.dart';
import 'api_service.dart';
import 'notification_service.dart';

final getIt = GetIt.instance;

void setupServiceLocator() {
  // Services
  getIt.registerLazySingleton<LocationService>(() => LocationService());
  getIt.registerLazySingleton<ApiService>(() => ApiService());
  getIt.registerLazySingleton<NotificationService>(() => NotificationService());
}
