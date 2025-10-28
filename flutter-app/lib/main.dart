import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';

import 'core/services/service_locator.dart';
import 'core/services/location_service.dart';
import 'core/services/api_service.dart';
import 'features/splash/splash_screen.dart';
import 'features/onboarding/onboarding_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/home/home_screen.dart';
import 'features/ar_hunt/ar_camera_screen.dart';
import 'features/map/map_screen.dart';
import 'features/inventory/inventory_screen.dart';
import 'features/profile/profile_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Firebase
  await Firebase.initializeApp();

  // Setup dependency injection
  setupServiceLocator();

  runApp(const KuponGoApp());
}

class KuponGoApp extends StatelessWidget {
  const KuponGoApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => getIt<LocationService>()),
        ChangeNotifierProvider(create: (_) => getIt<ApiService>()),
      ],
      child: MaterialApp(
        title: 'KuponGo',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF667EEA),
            brightness: Brightness.light,
          ),
          fontFamily: 'Poppins',
        ),
        darkTheme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF667EEA),
            brightness: Brightness.dark,
          ),
          fontFamily: 'Poppins',
        ),
        themeMode: ThemeMode.system,
        initialRoute: '/splash',
        routes: {
          '/splash': (context) => const SplashScreen(),
          '/onboarding': (context) => const OnboardingScreen(),
          '/login': (context) => const LoginScreen(),
          '/home': (context) => const HomeScreen(),
          '/ar': (context) => const ARCameraScreen(),
          '/map': (context) => const MapScreen(),
          '/inventory': (context) => const InventoryScreen(),
          '/profile': (context) => const ProfileScreen(),
        },
      ),
    );
  }
}
