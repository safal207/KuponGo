# KuponGo - Технологический Стек

## 🎯 Выбранный стек

### Фаза 1: WebXR Demo (Веб-демо для презентаций)
- **Frontend**: Three.js + WebXR API
- **3D**: GLTF модели
- **Сервер**: Node.js + Express
- **Время разработки**: 5-7 дней

### Фаза 2: MVP Мобильное приложение (Flutter)
- **Framework**: Flutter 3.19+
- **AR**: ARCore (Android) + ARKit (iOS)
- **Карты**: Google Maps API
- **Backend**: Node.js + Express + PostgreSQL
- **Push**: Firebase Cloud Messaging
- **Аналитика**: Firebase Analytics
- **Время разработки**: 3-4 недели

---

## 📦 Детальная архитектура

### Frontend (Flutter)
```
lib/
├── core/
│   ├── ar/                    # AR движок
│   │   ├── ar_manager.dart
│   │   ├── coupon_renderer.dart
│   │   └── gesture_handler.dart
│   ├── geolocation/           # Геолокация
│   │   ├── location_service.dart
│   │   └── proximity_detector.dart
│   └── notifications/         # Push уведомления
│       └── push_service.dart
├── features/
│   ├── ar_hunt/              # AR охота
│   │   ├── ar_camera_screen.dart
│   │   ├── catch_animation.dart
│   │   └── coupon_preview.dart
│   ├── map/                  # Карта купонов
│   │   ├── map_screen.dart
│   │   └── coupon_markers.dart
│   ├── inventory/            # Инвентарь пойманных
│   │   └── my_coupons.dart
│   └── profile/              # Профиль
│       └── profile_screen.dart
└── main.dart
```

### Backend (Node.js)
```
backend/
├── src/
│   ├── api/
│   │   ├── coupons/          # Купоны API
│   │   ├── users/            # Пользователи
│   │   └── businesses/       # Бизнесы
│   ├── services/
│   │   ├── geofencing.js     # Геозоны
│   │   ├── spawner.js        # Генерация купонов
│   │   └── analytics.js      # Аналитика
│   └── database/
│       └── models/
│           ├── Coupon.js
│           ├── User.js
│           └── Business.js
└── server.js
```

---

## 🔧 Зависимости

### Flutter (pubspec.yaml)
```yaml
dependencies:
  flutter:
    sdk: flutter

  # AR
  arcore_flutter_plugin: ^0.1.0
  arkit_plugin: ^1.0.7

  # Карты и геолокация
  google_maps_flutter: ^2.5.0
  geolocator: ^10.1.0
  geocoding: ^2.1.1

  # 3D рендеринг
  vector_math: ^2.1.4

  # Firebase
  firebase_core: ^2.24.0
  firebase_messaging: ^14.7.6
  firebase_analytics: ^10.8.0

  # Сеть
  http: ^1.1.0
  dio: ^5.4.0

  # State management
  provider: ^6.1.1

  # UI
  lottie: ^3.0.0  # Анимации
  shimmer: ^3.0.0  # Загрузки
```

### WebXR Demo (package.json)
```json
{
  "dependencies": {
    "three": "^0.160.0",
    "@types/three": "^0.160.0",
    "express": "^4.18.2"
  }
}
```

---

## 🎮 AR Механики - Технические детали

### 1. Обнаружение купона (Proximity Detection)
```dart
// Алгоритм:
1. Background location tracking (каждые 30 сек)
2. Geofencing API (радиус 100м от купона)
3. Trigger: Push уведомление
4. Запуск AR режима
```

### 2. AR рендеринг
```dart
// ARCore/ARKit:
- Plane detection (горизонтальные поверхности)
- 3D модель купона в 2м от пользователя
- Анимация: вращение + bounce
- Tap gesture = ловля
```

### 3. Поймать купон (Catch Logic)
```dart
// Условия успешной ловли:
if (distance < 3.0 meters &&
    userTapped &&
    !expired) {
  triggerCatchAnimation();
  saveCouponToInventory();
  showSuccessPopup();
}
```

---

## 📊 База данных (PostgreSQL)

### Схема таблиц
```sql
-- Купоны в мире
CREATE TABLE coupons (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  discount_percent INT,
  rarity ENUM('common', 'rare', 'epic', 'legendary'),
  expires_at TIMESTAMP,
  spawn_radius INT DEFAULT 50, -- метры
  model_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Пойманные купоны
CREATE TABLE caught_coupons (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  coupon_id UUID REFERENCES coupons(id),
  caught_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Пользователи
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(100) UNIQUE,
  total_caught INT DEFAULT 0,
  rare_caught INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Бизнесы
CREATE TABLE businesses (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  subscription_tier ENUM('basic', 'premium', 'enterprise'),
  active_coupons_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Производительность

### Оптимизации
```dart
1. AR рендеринг:
   - Target: 60 FPS
   - LOD (Level of Detail) для далеких объектов
   - Frustum culling

2. Геолокация:
   - Батарея: < 5% в час
   - Background: каждые 30 сек
   - Foreground: каждые 5 сек

3. 3D модели:
   - GLTF формат (сжатый)
   - < 2MB на модель
   - Кеширование локально
```

---

## 🔐 Безопасность

### Защита от читов
```javascript
// Backend проверки:
1. GPS spoofing detection:
   - Проверка скорости перемещения
   - Анализ паттернов движения
   - Device integrity check

2. Rate limiting:
   - Max 10 купонов в час
   - Max 3 легендарных в день

3. Device fingerprint:
   - Один аккаунт = одно устройство
```

---

## 📈 Масштабируемость

### Архитектура для роста
```
Load Balancer
    ↓
API Servers (Node.js) × 3-5
    ↓
Redis Cache (geolocation queries)
    ↓
PostgreSQL Master → Replicas
    ↓
CDN (3D модели, изображения)
```

### Расчеты:
- 10,000 пользователей онлайн = ~200 req/sec
- 100,000 купонов в БД = ~500MB данных
- Сервер: 4 CPU, 8GB RAM, $40/мес (DigitalOcean)

---

## 🎨 3D Ассеты

### Форматы
- **GLTF 2.0** (primary) - эффективный, поддержка анимаций
- **OBJ** (fallback) - простой, универсальный

### Создание моделей
```bash
# Инструменты:
1. Blender (бесплатно) - создание моделей
2. Sketchfab - библиотека готовых моделей
3. Polycam - 3D сканирование реальных объектов
```

---

## 🧪 Тестирование

### Стратегия
```dart
1. Unit тесты:
   - Геолокация логика
   - Catch механика
   - API клиенты

2. Widget тесты:
   - UI компоненты
   - Навигация

3. Integration тесты:
   - AR сценарии
   - Полный flow ловли купона

4. Ручное тестирование:
   - Разные устройства (iOS/Android)
   - Разные погодные условия (освещение)
   - Edge cases (слабый GPS, нет интернета)
```

---

## 📱 Минимальные требования

### iOS
- iOS 13.0+
- ARKit поддержка (iPhone 6S и новее)
- GPS + Camera

### Android
- Android 8.0+
- ARCore поддержка ([список устройств](https://developers.google.com/ar/devices))
- GPS + Camera

---

## 💰 Стоимость разработки (оценка)

| Этап | Время | Стоимость (фриланс) |
|------|-------|---------------------|
| WebXR демо | 1 неделя | $500-1000 |
| Flutter MVP | 4 недели | $4000-8000 |
| Backend API | 2 недели | $2000-4000 |
| 3D модели (базовые) | 1 неделя | $500-1500 |
| Тестирование | 1 неделя | $1000-2000 |
| **ИТОГО** | **9-10 недель** | **$8,000-16,000** |

### Ежемесячные расходы
- Сервер: $40-100
- Firebase: $0-50 (до 10k пользователей)
- Google Maps API: $200-500
- 3D хостинг (CDN): $20-50
- **ИТОГО**: ~$300-700/месяц

---

## 🎯 Roadmap разработки

### Неделя 1: WebXR Demo
- [x] Базовая 3D сцена
- [x] AR режим в браузере
- [ ] Интерактивный купон
- [ ] Анимация ловли

### Недели 2-5: Flutter MVP
- [ ] Настройка проекта
- [ ] ARCore/ARKit интеграция
- [ ] Геолокация и карты
- [ ] Backend API
- [ ] UI/UX

### Неделя 6: Тестирование
- [ ] Баг фиксы
- [ ] Оптимизация производительности
- [ ] Полировка анимаций

### Неделя 7+: Бета-запуск
- [ ] Закрытая бета
- [ ] Feedback сбор
- [ ] Итерации

---

Готов начать? Создаем структуру проекта! 🚀
