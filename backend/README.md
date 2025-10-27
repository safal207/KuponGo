# KuponGo Backend API

REST API сервер для KuponGo - location-based AR купонного приложения.

## 🚀 Быстрый старт

### 1. Установка

```bash
cd backend
npm install
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите свои значения:
```env
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### 3. Запуск сервера

```bash
npm start
```

API будет доступен на `http://localhost:5000`

### Режим разработки (с автоперезагрузкой):

```bash
npm run dev
```

## 📡 API Endpoints

### Health Check
```
GET /health
```
Проверка работоспособности сервера

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-27T12:00:00.000Z",
  "uptime": 123.45
}
```

---

### 🎫 Coupons (Купоны)

#### Получить купоны рядом
```
GET /api/coupons/nearby?lat=55.7558&lng=37.6173&radius=1000
```

**Query Parameters:**
- `lat` (required) - Широта пользователя
- `lng` (required) - Долгота пользователя
- `radius` (optional) - Радиус поиска в метрах (default: 1000)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "coupons": [
    {
      "id": "uuid",
      "title": "Кофе -25%",
      "business_name": "Starbucks",
      "discount_percent": 25,
      "rarity": "rare",
      "distance": 125,
      "latitude": 55.7558,
      "longitude": 37.6173,
      "expires_at": "2025-10-28T12:00:00.000Z"
    }
  ]
}
```

#### Поймать купон
```
POST /api/coupons/:id/catch
```

**Body:**
```json
{
  "userId": "user-uuid",
  "userLat": 55.7558,
  "userLng": 37.6173
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon caught successfully!",
  "caughtCoupon": {...},
  "xpGained": 50
}
```

#### Использовать купон
```
POST /api/coupons/:id/use
```

**Body:**
```json
{
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon used successfully!",
  "qrCode": "KUPON-ABC12345"
}
```

#### Получить купоны пользователя
```
GET /api/coupons/user/:userId?active=true
```

**Query Parameters:**
- `active` (optional) - Фильтр по активным (default: true)

---

### 👤 Users (Пользователи)

#### Регистрация
```
POST /api/users/register
```

**Body:**
```json
{
  "username": "hunter123",
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "hunter123",
    "email": "user@example.com",
    "level": 1,
    "xp": 0
  },
  "token": "jwt_token_here"
}
```

#### Логин
```
POST /api/users/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

#### Профиль пользователя
```
GET /api/users/:id
```

#### Статистика пользователя
```
GET /api/users/:id/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "level": 12,
    "xp": 2450,
    "xpToNextLevel": 6000,
    "totalCaught": 247,
    "byRarity": {
      "common": 148,
      "rare": 78,
      "epic": 18,
      "legendary": 3
    },
    "achievements": [...],
    "totalSaved": 3828.5,
    "distanceWalked": 123.5
  }
}
```

---

### 🏪 Businesses (Бизнесы)

#### Получить все бизнесы
```
GET /api/businesses
```

#### Создать бизнес
```
POST /api/businesses
```

**Body:**
```json
{
  "name": "Starbucks",
  "category": "food",
  "location_lat": 55.7558,
  "location_lng": 37.6173,
  "subscription_tier": "premium"
}
```

#### Создать купон для бизнеса
```
POST /api/businesses/:id/coupons
```

**Body:**
```json
{
  "title": "Кофе -25%",
  "description": "Скидка на любой напиток",
  "discount_percent": 25,
  "rarity": "rare",
  "duration": 24
}
```

#### Аналитика бизнеса
```
GET /api/businesses/:id/analytics
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "period": "7d",
    "impressions": 1247,
    "caught": 342,
    "catchRate": 27.4,
    "used": 189,
    "usageRate": 55.2,
    "newCustomers": 67
  }
}
```

---

## 🗄️ Структура проекта

```
backend/
├── src/
│   ├── api/
│   │   ├── coupons/
│   │   │   ├── routes.js      # Роуты
│   │   │   └── controller.js  # Бизнес-логика
│   │   ├── users/
│   │   │   ├── routes.js
│   │   │   └── controller.js
│   │   └── businesses/
│   │       ├── routes.js
│   │       └── controller.js
│   ├── services/
│   │   └── spawner.js         # Сервис генерации купонов
│   ├── database/
│   │   └── models/            # Модели данных
│   └── middleware/            # Middleware (auth, validation)
├── server.js                  # Главный файл сервера
├── .env.example               # Пример конфигурации
├── package.json
└── README.md
```

## 🔧 Сервисы

### Coupon Spawner

Автоматически генерирует купоны в зависимости от:
- Времени суток
- Дня недели
- Категории бизнеса
- Популярности локации

Запускается автоматически при старте сервера.

**Настройки** (в `.env`):
```env
COUPON_SPAWN_INTERVAL=300000  # 5 минут
DEFAULT_SPAWN_RADIUS=50       # метров
MAX_COUPONS_PER_AREA=5        # максимум купонов
```

## 🔐 Безопасность

- JWT токены для аутентификации
- Bcrypt для хеширования паролей
- Валидация расстояния при ловле купонов
- Rate limiting (планируется)
- GPS spoofing detection

## 🚧 TODO (Будущие улучшения)

- [ ] Подключить реальную PostgreSQL БД
- [ ] Добавить Redis для кеширования
- [ ] Реализовать WebSocket для real-time уведомлений
- [ ] Добавить rate limiting
- [ ] Swagger документация
- [ ] Unit и integration тесты
- [ ] Docker контейнеризация
- [ ] CI/CD pipeline

## 📊 Мониторинг

Доступные метрики:
- Uptime сервера: `/health`
- Статус spawner: `/api/spawner/status` (планируется)

## 🐛 Отладка

Включить детальное логирование:
```env
NODE_ENV=development
DEBUG=*
```

## 📝 Лицензия

MIT

## 🤝 Вклад в проект

Создавайте Pull Requests и Issues!
