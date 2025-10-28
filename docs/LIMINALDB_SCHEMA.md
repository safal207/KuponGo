# KuponGo - LiminalDB Schema

## Обзор

KuponGo использует LiminalDB вместо PostgreSQL. LiminalDB - это "живая" база данных с клетками, импульсами и адаптивным поведением.

## Концепции LiminalDB

### Импульсы (Impulses)
Вместо SQL-запросов используются 3 типа импульсов:
- **affect** - воздействие (изменение состояния)
- **query** - запрос данных
- **write** - запись данных

### Паттерны
Вместо таблиц/схем используются текстовые паттерны:
```
coupon/nearby/{lat}/{lng}
coupon/{id}/details
user/{userId}/stats
business/{businessId}/analytics
```

## Структура данных KuponGo

### 1. Купоны (Coupons)

**Паттерны:**
```
coupon/spawn/{couponId}           # Создание купона
coupon/{couponId}/catch           # Ловля купона
coupon/{couponId}/use             # Использование купона
coupon/nearby/{lat}/{lng}         # Поиск рядом
coupon/business/{businessId}      # Купоны бизнеса
```

**Структура импульса (Write):**
```json
{
  "k": 2,
  "p": "coupon/spawn/uuid-123",
  "s": 0.8,
  "t": 86400000,
  "tg": ["rare", "food", "starbucks"],
  "meta": {
    "id": "uuid-123",
    "business_id": "uuid-456",
    "business_name": "Starbucks",
    "title": "Кофе -25%",
    "description": "Скидка 25% на любой напиток",
    "discount_percent": 25,
    "rarity": "rare",
    "category": "food",
    "latitude": 55.7558,
    "longitude": 37.6173,
    "spawn_radius": 50,
    "expires_at": 1730000000000,
    "model_url": "/models/coupon_rare.gltf",
    "created_at": 1729950000000
  }
}
```

**Запрос рядом (Query):**
```json
{
  "k": 1,
  "p": "coupon/nearby/55.7558/37.6173",
  "s": 0.7,
  "t": 5000,
  "tg": ["proximity", "radius:1000"]
}
```

### 2. Пользователи (Users)

**Паттерны:**
```
user/register/{userId}
user/{userId}/login
user/{userId}/stats
user/{userId}/coupons
user/{userId}/catch/{couponId}
```

**Регистрация (Write):**
```json
{
  "k": 2,
  "p": "user/register/uuid-789",
  "s": 1.0,
  "t": 0,
  "tg": ["auth", "new_user"],
  "meta": {
    "id": "uuid-789",
    "username": "hunter123",
    "email": "hunter@example.com",
    "password_hash": "bcrypt_hash",
    "level": 1,
    "xp": 0,
    "total_caught": 0,
    "rare_caught": 0,
    "created_at": 1729950000000
  }
}
```

**Статистика (Query):**
```json
{
  "k": 1,
  "p": "user/uuid-789/stats",
  "s": 0.6,
  "t": 3000
}
```

### 3. Пойманные купоны (Caught Coupons)

**Паттерны:**
```
caught/{userId}/{couponId}
caught/{userId}/active
caught/{userId}/used
```

**Ловля купона (Write):**
```json
{
  "k": 2,
  "p": "caught/uuid-789/uuid-123",
  "s": 1.0,
  "t": 0,
  "tg": ["rare", "food", "active"],
  "meta": {
    "id": "caught-uuid",
    "user_id": "uuid-789",
    "coupon_id": "uuid-123",
    "caught_at": 1729951000000,
    "used_at": null,
    "is_active": true,
    "xp_gained": 50
  }
}
```

### 4. Бизнесы (Businesses)

**Паттерны:**
```
business/create/{businessId}
business/{businessId}/analytics
business/{businessId}/coupons
```

**Создание бизнеса (Write):**
```json
{
  "k": 2,
  "p": "business/create/uuid-456",
  "s": 1.0,
  "t": 0,
  "tg": ["food", "premium"],
  "meta": {
    "id": "uuid-456",
    "name": "Starbucks",
    "category": "food",
    "location_lat": 55.7558,
    "location_lng": 37.6173,
    "subscription_tier": "premium",
    "active_coupons_count": 5,
    "created_at": 1729950000000
  }
}
```

## LQL Запросы

### Подписка на купоны рядом
```lql
SUBSCRIBE coupon/nearby/* WHERE strength>=0.7 WINDOW 60000 EVERY 5000
```

### Выборка активных купонов пользователя
```lql
SELECT caught/{userId}/active WHERE adreno=false WINDOW 10000
```

### Мониторинг новых регистраций
```lql
SUBSCRIBE user/register/* WINDOW 300000 EVERY 30000
```

## Namespaces и Auth

### Пространства имен
```
alpha   - Production данные
beta    - Staging
gamma   - Development
```

### API ключи
```json
{
  "cmd": "key.add",
  "key": {
    "id": "kupongo-api-prod",
    "secret": "your_secret_here",
    "role": "Writer",
    "ns": "alpha"
  }
}
```

### Квоты
```json
{
  "cmd": "quota.set",
  "ns": "alpha",
  "q": {
    "rps": 500,
    "burst": 1000,
    "max_cells": 10000,
    "max_views": 100
  }
}
```

## Индексирование и поиск

### Геопространственный поиск
LiminalDB не имеет встроенной геопространственной индексации, поэтому используем теги:

```javascript
// При создании купона добавляем геохеш в теги
const geohash = encodeGeohash(lat, lng, precision=6); // "u4pruydq"

{
  "k": 2,
  "p": "coupon/spawn/uuid-123",
  "s": 0.8,
  "t": 86400000,
  "tg": [
    "rare",
    "food",
    `geo:${geohash}`,  // "geo:u4pruydq"
    `lat:${Math.floor(lat * 100)}`,  // "lat:5575"
    `lng:${Math.floor(lng * 100)}`   // "lng:3761"
  ]
}
```

### Поиск по радиусу
```javascript
// На стороне приложения вычисляем соседние геохеши
const nearby = getGeohashNeighbors(userGeohash, radius);

// Подписываемся на все геохеши в радиусе
for (const hash of nearby) {
  client.subscribe(`coupon/*`, {
    tags: [`geo:${hash}`],
    window: 60000,
    every: 5000
  });
}
```

## Рефлексы (автоматические реакции)

### Автоспавн купонов по времени суток
```json
{
  "token": "time/breakfast",
  "kind": "Affect",
  "min_strength": 0.7,
  "window_ms": 60000,
  "min_count": 1,
  "then": {
    "SpawnSeed": {
      "seed": "coupon/spawn/cafe/*",
      "affinity_shift": 0.5
    }
  }
}
```

### Буст редких купонов при низкой активности
```json
{
  "token": "activity/low",
  "kind": "Query",
  "min_strength": 0.6,
  "window_ms": 30000,
  "min_count": 10,
  "then": {
    "BoostLinks": {
      "factor": 1.5,
      "top": 20
    }
  }
}
```

## Dream Mode (оптимизация)

### Конфигурация сна
```json
{
  "cmd": "dream.set",
  "cfg": {
    "min_idle_s": 300,
    "window_ms": 10000,
    "strengthen_top_pct": 0.2,
    "weaken_bottom_pct": 0.3,
    "protect_salience": 0.7,
    "adreno_protect": true,
    "max_ops_per_cycle": 1000
  }
}
```

Во время сна LiminalDB:
- Усиливает часто используемые паттерны (популярные купоны)
- Ослабляет редкие паттерны
- Защищает важные данные (с высокой salience)

## Примеры использования

### Создать купон
```javascript
const impulse = {
  k: 2, // Write
  p: `coupon/spawn/${couponId}`,
  s: 0.9,
  t: 86400000, // 24 часа
  tg: ['rare', 'food', 'starbucks', `geo:${geohash}`],
  meta: couponData
};

await liminalClient.push(impulse);
```

### Найти купоны рядом
```javascript
const impulse = {
  k: 1, // Query
  p: `coupon/nearby/${lat}/${lng}`,
  s: 0.7,
  t: 5000
};

const result = await liminalClient.pushAndPull(impulse);
// result.events содержит события с купонами
```

### Поймать купон
```javascript
const impulse = {
  k: 2, // Write
  p: `caught/${userId}/${couponId}`,
  s: 1.0,
  t: 0,
  tg: [rarity, category, 'active'],
  meta: caughtData
};

await liminalClient.push(impulse);

// Также отправить Affect для обновления статистики
await liminalClient.push({
  k: 0, // Affect
  p: `user/${userId}/stats/increment`,
  s: 0.8,
  t: 1000,
  meta: { field: 'total_caught', value: 1 }
});
```

## Преимущества использования LiminalDB для KuponGo

1. **Адаптивность** - система автоматически оптимизируется под нагрузку
2. **Real-time** - события распространяются мгновенно через WebSocket
3. **Геймификация** - естественная интеграция с игровой механикой (клетки = купоны)
4. **Масштабируемость** - легковесное ядро без внешних зависимостей
5. **Живая система** - купоны могут "засыпать" когда неактивны, "делиться" когда популярны

## Мониторинг

### Метрики системы
```javascript
// Подписаться на метрики
client.subscribe('metrics', { every: 5000 });

// Получать события:
{
  "ev": "metrics",
  "metrics": {
    "cells": 10000,        // всего купонов в системе
    "sleeping": 0.6,       // 60% неактивных купонов
    "avgMet": 0.45,        // средний метаболизм
    "avgLat": 85           // латентность 85мс
  }
}
```

### Harmony Loop
Автоматически балансирует нагрузку и производительность системы.

---

## Дальнейшая оптимизация

- Использовать **теги adreno** для "горячих" купонов (популярные или скоро истекают)
- Настроить **Collective Dreaming** для синхронизации купонов в одной локации
- Применять **Symmetry Loop** для балансировки загрузки по регионам
