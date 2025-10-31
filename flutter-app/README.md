# KuponGo - Flutter Mobile App

> AR location-based coupon hunting application для iOS и Android

## 📱 О приложении

KuponGo - это мобильное приложение в стиле Pokemon GO для охоты за виртуальными купонами в дополненной реальности.

### Основные функции

- **AR Охота** - Ловите голографические купоны через камеру телефона
- **Карта купонов** - Смотрите все доступные купоны на карте
- **Геолокация** - Получайте push-уведомления когда рядом появляется купон
- **Инвентарь** - Управляйте пойманными купонами
- **Профиль** - Отслеживайте статистику и достижения
- **4 уровня редкости** - Common, Rare, Epic, Legendary

## 🚀 Установка

### Требования

- Flutter 3.19 или новее
- Dart SDK 3.0 или новее
- Android Studio / Xcode
- Устройство с ARCore (Android) или ARKit (iOS)

### Шаги установки

1. Клонировать репозиторий:
```bash
git clone https://github.com/safal207/KuponGo.git
cd KuponGo/flutter-app
```

2. Установить зависимости:
```bash
flutter pub get
```

3. Настроить Firebase:
```bash
# Скачайте google-services.json (Android) и GoogleService-Info.plist (iOS)
# из Firebase Console и положите в соответствующие папки
```

4. Запустить приложение:
```bash
flutter run
```

## 📁 Структура проекта

```
flutter-app/
├── lib/
│   ├── main.dart                    # Точка входа
│   ├── core/
│   │   ├── services/                # Сервисы
│   │   │   ├── service_locator.dart
│   │   │   ├── location_service.dart
│   │   │   ├── api_service.dart
│   │   │   └── notification_service.dart
│   │   └── ar/                      # AR движок (TODO)
│   └── features/
│       ├── splash/                  # Splash экран
│       ├── onboarding/              # Онбординг
│       ├── auth/                    # Авторизация
│       ├── home/                    # Главный экран
│       ├── ar_hunt/                 # AR охота
│       ├── map/                     # Карта
│       ├── inventory/               # Инвентарь
│       └── profile/                 # Профиль
├── pubspec.yaml
└── README.md
```

## 🔧 Конфигурация

### Android (android/app/build.gradle)

```gradle
android {
    compileSdkVersion 34
    minSdkVersion 24  // ARCore требует API 24+
    targetSdkVersion 34
}

dependencies {
    implementation 'com.google.ar:core:1.40.0'
}
```

### iOS (ios/Podfile)

```ruby
platform :ios, '13.0'

target 'Runner' do
  pod 'ARKit'
end
```

### Разрешения

**Android (android/app/src/main/AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />

<uses-feature android:name="android.hardware.camera.ar" android:required="true"/>
```

**iOS (ios/Runner/Info.plist):**
```xml
<key>NSCameraUsageDescription</key>
<string>Нужна камера для AR режима</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Нужна геолокация для поиска купонов</string>
```

## 🎮 Использование

### Запуск на эмуляторе

```bash
# Android
flutter run -d emulator-5554

# iOS
flutter run -d "iPhone 15"
```

**Примечание:** AR функции не работают на эмуляторах. Используйте реальное устройство.

### Запуск на реальном устройстве

```bash
# Android (через USB)
flutter run -d <device-id>

# iOS (через Xcode)
open ios/Runner.xcworkspace
# Затем Run из Xcode
```

### Сборка Release

```bash
# Android APK
flutter build apk --release

# Android App Bundle
flutter build appbundle --release

# iOS
flutter build ios --release
# Затем загрузить через Xcode
```

## 🔌 API Integration

Приложение подключается к Backend API:

```dart
// lib/core/services/api_service.dart
class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';
  // Или для production:
  // static const String baseUrl = 'https://api.kupongo.app';
}
```

## 🧪 Тестирование

```bash
# Unit тесты
flutter test

# Widget тесты
flutter test test/widget_test.dart

# Integration тесты
flutter drive --target=test_driver/app.dart
```

## 🐛 Troubleshooting

### ARCore не работает

- Проверьте список поддерживаемых устройств: https://developers.google.com/ar/devices
- Убедитесь что Google Play Services for AR установлены
- Минимальная версия Android: 7.0 (API 24)

### ARKit не работает

- iPhone 6S или новее
- iOS 13.0 или новее
- Проверьте настройки конфиденциальности (Камера)

### GPS не работает

- Включите GPS на устройстве
- Дайте разрешения на геолокацию в настройках приложения
- На Android: проверьте Google Play Services

### Ошибка сборки

```bash
# Очистить кеш
flutter clean
flutter pub get

# Пересобрать
flutter build apk --release
```

## 📦 Зависимости

### Основные

- `arcore_flutter_plugin` - ARCore для Android
- `arkit_plugin` - ARKit для iOS
- `google_maps_flutter` - Google Maps
- `geolocator` - Геолокация
- `firebase_core` - Firebase
- `firebase_messaging` - Push уведомления

### UI

- `lottie` - Анимации
- `shimmer` - Loading эффекты
- `cached_network_image` - Кеширование изображений

### Networking

- `dio` - HTTP клиент
- `provider` - State management

## 🎨 Кастомизация

### Темы

Измените цветовую схему в `lib/main.dart`:

```dart
theme: ThemeData(
  colorScheme: ColorScheme.fromSeed(
    seedColor: const Color(0xFF667EEA),  // Измените здесь
  ),
)
```

### Иконки

Замените `assets/images/logo.png` на свой логотип.

## 📄 Лицензия

MIT License

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Создайте Pull Request

## 📞 Поддержка

- GitHub Issues: https://github.com/safal207/KuponGo/issues
- Email: support@kupongo.app

---

**Сделано с ❤️ командой KuponGo**
