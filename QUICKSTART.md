# 🚀 KuponGo - Быстрый Старт

Полное руководство по запуску проекта KuponGo с нуля.

---

## 📋 Предварительные требования

### Установленное ПО:
- **Node.js** 18+ и npm ([скачать](https://nodejs.org/))
- **Git** ([скачать](https://git-scm.com/))
- **Flutter** 3.19+ (для мобильного приложения, опционально)
- **PostgreSQL** 14+ (для production, опционально)

### Проверка установки:
```bash
node --version  # v18.0.0+
npm --version   # 9.0.0+
git --version   # 2.30.0+
```

---

## ⚡ Быстрый запуск (5 минут)

### Вариант 1: Только WebXR демо (самое простое)

```bash
# 1. Клонировать репозиторий
git clone https://github.com/safal207/KuponGo.git
cd KuponGo/webxr-demo

# 2. Установить зависимости
npm install

# 3. Запустить
npm start
```

Откройте браузер: `http://localhost:3000`

**Готово!** 🎉 Можете показывать демо инвесторам.

---

### Вариант 2: WebXR Demo + Backend API

```bash
# Терминал 1: Backend
cd KuponGo/backend
npm install
npm start
# Запустится на http://localhost:5000

# Терминал 2: WebXR Demo
cd KuponGo/webxr-demo
npm install
npm start
# Запустится на http://localhost:3000
```

Теперь у вас работает:
- WebXR демо на порту 3000
- Backend API на порту 5000

Проверить API: `http://localhost:5000/api/coupons/nearby?lat=55.7558&lng=37.6173&radius=1000`

---

## 📱 Тестирование на реальном телефоне

### Способ 1: Локальная сеть

1. Запустите WebXR demo:
```bash
cd webxr-demo
npm start
```

2. Узнайте свой локальный IP:
```bash
# Mac/Linux:
ifconfig | grep "inet "

# Windows:
ipconfig
```

3. Откройте на телефоне: `http://[ваш-ip]:3000`

**Проблема:** WebXR требует HTTPS!

---

### Способ 2: ngrok (рекомендуется для AR)

1. Установите ngrok:
```bash
npm install -g ngrok
```

2. В одном терминале запустите сервер:
```bash
cd webxr-demo
npm start
```

3. В другом терминале:
```bash
ngrok http 3000
```

4. ngrok выдаст HTTPS ссылку типа: `https://abc123.ngrok.io`

5. Откройте эту ссылку на телефоне!

**AR заработает только на HTTPS!**

---

## 🗂️ Структура запуска по компонентам

### 1️⃣ WebXR Demo

**Что это:** Браузерная AR демо-версия для презентаций

```bash
cd webxr-demo
npm install
npm start
```

**Порт:** 3000
**Доступ:** http://localhost:3000

**Что можно делать:**
- ✅ Показать концепцию AR
- ✅ Протестировать механику ловли
- ✅ Демонстрация инвесторам
- ❌ Нет реальной геолокации
- ❌ Нет сохранения данных

**Для разработки (hot reload):**
```bash
npm run dev
```

---

### 2️⃣ Backend API

**Что это:** REST API сервер с mock данными

```bash
cd backend
npm install

# Создать .env файл
cp .env.example .env

# Запустить
npm start
```

**Порт:** 5000
**Доступ:** http://localhost:5000

**Endpoints:**
- `GET /health` - Проверка работы
- `GET /api/coupons/nearby` - Купоны рядом
- `POST /api/coupons/:id/catch` - Поймать купон
- `POST /api/users/register` - Регистрация
- И другие... (см. backend/README.md)

**Для разработки:**
```bash
npm run dev
```

**Тестирование API:**
```bash
# Получить купоны рядом с Москвой
curl "http://localhost:5000/api/coupons/nearby?lat=55.7558&lng=37.6173&radius=1000"

# Health check
curl http://localhost:5000/health
```

---

### 3️⃣ Flutter App (MVP)

**Статус:** 🚧 В разработке

```bash
cd flutter-app
flutter pub get
flutter run
```

Требуется:
- Android эмулятор с ARCore
- iOS симулятор (без AR) или реальное устройство

---

## 🔧 Настройка окружения

### Backend .env конфигурация

Скопируйте `.env.example` в `.env`:

```env
PORT=5000
NODE_ENV=development

# Базовые настройки (для MVP без БД)
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password

# JWT секрет (сгенерируйте свой!)
JWT_SECRET=change_this_to_random_string

# Опционально:
GOOGLE_MAPS_API_KEY=your_api_key
```

**Генерация JWT секрета:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐳 Docker (опционально)

Запустить всё в Docker контейнерах:

```bash
# В разработке...
docker-compose up
```

---

## 🧪 Тестирование функционала

### 1. Проверить WebXR Demo

1. Откройте http://localhost:3000
2. Нажмите "ЗАПУСТИТЬ AR"
3. Разрешите доступ к камере
4. Увидите голографический купон
5. Нажмите "TAP TO CATCH"
6. Должна появиться анимация успеха

### 2. Проверить Backend API

```bash
# Регистрация пользователя
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Получить купоны
curl "http://localhost:5000/api/coupons/nearby?lat=55.7558&lng=37.6173&radius=1000"
```

---

## 🔥 Типичные проблемы и решения

### Проблема: "Cannot find module 'three'"

**Решение:**
```bash
cd webxr-demo
rm -rf node_modules package-lock.json
npm install
```

---

### Проблема: "Port 3000 already in use"

**Решение 1:** Убить процесс на порту
```bash
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Решение 2:** Изменить порт
```bash
# В webxr-demo/src/server.js
const PORT = process.env.PORT || 3001;
```

---

### Проблема: WebXR не работает в браузере

**Причины:**
1. Используется HTTP вместо HTTPS
2. Браузер не поддерживает WebXR
3. Нет доступа к камере

**Решение:**
- Используйте ngrok для HTTPS
- Проверьте поддержку: https://immersiveweb.dev/
- Разрешите доступ к камере в настройках браузера

---

### Проблема: AR не запускается на iOS

**Причина:** Safari имеет ограниченную WebXR поддержку

**Решение:**
- Используйте Mozilla WebXR Viewer
- Или дождитесь Flutter версии с ARKit

---

### Проблема: Backend не подключается к БД

**Причина:** PostgreSQL не установлен или не запущен

**Решение для MVP:**
Backend работает с mock данными в памяти - БД не требуется!

**Для production:**
```bash
# Установить PostgreSQL
brew install postgresql  # Mac
# или скачать с официального сайта

# Запустить
brew services start postgresql
```

---

## 📊 Мониторинг и логи

### WebXR Demo логи
```bash
cd webxr-demo
npm start
# Смотрите в консоль терминала
```

### Backend логи
```bash
cd backend
npm start
# Все запросы логируются в консоль
```

### Детальное логирование
```bash
# В backend/.env
DEBUG=*
NODE_ENV=development
```

---

## 🚀 Деплой (Production)

### WebXR Demo на Vercel

```bash
cd webxr-demo
npm install -g vercel
vercel login
vercel deploy
```

### Backend на Railway/Render/Heroku

```bash
# Пример для Railway
cd backend
railway login
railway init
railway up
```

### Или используйте Docker

```dockerfile
# В разработке...
```

---

## 📚 Дополнительные ресурсы

### Документация проекта
- [README.md](README.md) - Общее описание
- [GAME_DESIGN.md](GAME_DESIGN.md) - Игровые механики
- [TECH_STACK.md](TECH_STACK.md) - Технологии
- [webxr-demo/README.md](webxr-demo/README.md) - WebXR гайд
- [backend/README.md](backend/README.md) - API документация

### Внешние ресурсы
- [Three.js Docs](https://threejs.org/docs/)
- [WebXR Device API](https://www.w3.org/TR/webxr/)
- [Flutter AR Plugins](https://pub.dev/packages?q=ar)
- [ARCore Supported Devices](https://developers.google.com/ar/devices)

---

## 🆘 Получить помощь

1. **GitHub Issues:** https://github.com/safal207/KuponGo/issues
2. **Discord:** [Community Server](#)
3. **Email:** support@kupongo.app

---

## ✅ Чеклист готовности

Проверьте что всё работает:

- [ ] WebXR demo открывается на localhost:3000
- [ ] Backend API отвечает на localhost:5000/health
- [ ] Можно поймать купон в WebXR demo
- [ ] API возвращает список купонов
- [ ] Тестирование на телефоне через ngrok (опционально)

**Если все пункты ✅ - вы готовы к разработке!**

---

## 🎯 Следующие шаги

1. **Изучите Game Design:** [GAME_DESIGN.md](GAME_DESIGN.md)
2. **Настройте Flutter:** Начните разработку мобильного MVP
3. **Подключите БД:** PostgreSQL для production
4. **Добавьте Firebase:** Push notifications
5. **Деплой:** Залейте на боевые серверы

**Удачи в разработке KuponGo!** 🎉

---

<div align="center">

**Вопросы? Создайте Issue!**

[GitHub](https://github.com/safal207/KuponGo) • [Docs](README.md) • [Community](#)

</div>
