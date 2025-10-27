# 🎯 KuponGo

> **Pokemon GO, но для скидок** - Ловите виртуальные купоны в дополненной реальности!

<div align="center">

![Status](https://img.shields.io/badge/status-MVP%20Development-yellow)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)

</div>

---

## 📖 Содержание

- [О проекте](#-о-проекте)
- [Особенности](#-особенности)
- [Технологии](#-технологии)
- [Структура проекта](#-структура-проекта)
- [Быстрый старт](#-быстрый-старт)
- [Документация](#-документация)
- [Roadmap](#-roadmap)
- [Контакты](#-контакты)

---

## 🎮 О проекте

**KuponGo** - это инновационное location-based AR приложение, которое геймифицирует процесс получения скидок и привлекает клиентов в офлайн магазины через механику "охоты" в дополненной реальности.

### Как это работает?

**Для пользователей:**
1. Получаешь push: "Рядом редкий купон -40%!"
2. Идешь к локации и открываешь AR режим
3. Ловишь виртуальный купон через камеру
4. Используешь реальную скидку в магазине

**Для бизнесов:**
1. Размещаешь виртуальные купоны у своего магазина
2. Платишь по подписке (от $99/мес)
3. Получаешь новых клиентов и аналитику
4. Увеличиваешь foot traffic

---

## ✨ Особенности

### 🎯 Геймификация
- **4 уровня редкости**: Common, Rare, Epic, Legendary
- **Система прогрессии**: Уровни, XP, достижения
- **Коллекционирование**: Собирай редкие купоны
- **Кооператив**: Ловите Epic купоны вместе с друзьями

### 📱 AR Технологии
- **ARCore/ARKit**: Нативная AR интеграция
- **3D голографические купоны**: Киберпанк эстетика
- **Интерактивная ловля**: Анимации, звуки, haptic feedback
- **Cloud Anchors**: Постоянные AR объекты (планируется)

### 📍 Геолокация
- **Real-time tracking**: Купоны появляются рядом
- **Smart spawning**: Купоны генерируются по времени суток
- **Geofencing**: Push уведомления при приближении
- **Anti-cheat**: Защита от GPS spoofing

### 📊 Аналитика для бизнеса
- Показы, ловли, конверсия
- Демографика пользователей
- Тепловые карты активности
- ROI калькулятор

---

## 🛠️ Технологии

### Frontend (Mobile)
- **Flutter 3.19+** - Кроссплатформенный фреймворк
- **ARCore/ARKit** - AR движки
- **Google Maps API** - Карты и геолокация
- **Firebase** - Push, аналитика, auth

### Backend
- **Node.js + Express** - REST API
- **PostgreSQL** - Основная БД
- **Redis** - Кеширование (планируется)
- **JWT** - Аутентификация

### WebXR Demo
- **Three.js** - 3D рендеринг
- **WebXR API** - AR в браузере
- **Express** - Статический сервер

---

## 📁 Структура проекта

```
KuponGo/
├── webxr-demo/             # WebXR демо для презентаций
│   ├── public/
│   ├── src/
│   └── README.md
│
├── backend/                # Node.js API сервер
│   ├── src/
│   │   ├── api/
│   │   │   ├── coupons/
│   │   │   ├── users/
│   │   │   └── businesses/
│   │   └── services/
│   ├── server.js
│   └── README.md
│
├── flutter-app/            # Flutter мобильное приложение
│   ├── lib/
│   │   ├── core/
│   │   │   ├── ar/
│   │   │   └── geolocation/
│   │   ├── features/
│   │   │   ├── ar_hunt/
│   │   │   ├── map/
│   │   │   └── inventory/
│   │   └── main.dart
│   └── pubspec.yaml
│
├── docs/                   # Документация
│   ├── GAME_DESIGN.md
│   ├── TECH_STACK.md
│   └── API.md
│
├── assets/                 # Ассеты проекта
│   └── 3d-models/          # 3D модели купонов
│
└── README.md              # Этот файл
```

---

## 🚀 Быстрый старт

### 1. WebXR Demo (для презентаций)

```bash
cd webxr-demo
npm install
npm start
```

Откройте `http://localhost:3000` в браузере.

📖 [Детальная инструкция](webxr-demo/README.md)

---

### 2. Backend API

```bash
cd backend
npm install
cp .env.example .env
# Отредактируйте .env
npm start
```

API доступен на `http://localhost:5000`

📖 [Детальная инструкция](backend/README.md)

---

### 3. Flutter App

```bash
cd flutter-app
flutter pub get
flutter run
```

Требуется Android/iOS эмулятор или физическое устройство.

📖 [Детальная инструкция](flutter-app/README.md) *(скоро)*

---

## 📚 Документация

### Основные документы

- **[Game Design Document](GAME_DESIGN.md)** - Детальное описание игровых механик
- **[Tech Stack](TECH_STACK.md)** - Технологический стек и архитектура
- **[API Documentation](backend/README.md)** - REST API endpoints
- **[WebXR Demo Guide](webxr-demo/README.md)** - Гайд по демо версии

### Дополнительно

- [Business Model](#) - Монетизация и тарифы
- [Privacy Policy](#) - Политика конфиденциальности
- [Terms of Service](#) - Условия использования

---

## 🗺️ Roadmap

### ✅ Phase 1: Proof of Concept (Текущий этап)
- [x] Game design документ
- [x] Технический стек
- [x] WebXR демо для презентаций
- [x] Backend API (mock данные)
- [ ] Flutter MVP (в процессе)
- [ ] 3D модели купонов

### 🚧 Phase 2: MVP (Недели 4-8)
- [ ] ARCore/ARKit интеграция
- [ ] Полноценная геолокация
- [ ] Firebase push notifications
- [ ] Базовая монетизация
- [ ] Закрытая бета (50 пользователей)

### 📅 Phase 3: Public Beta (Недели 9-12)
- [ ] PostgreSQL + Redis
- [ ] Продвинутая аналитика
- [ ] Social features (друзья, лидерборды)
- [ ] Первые 5 партнерских бизнесов
- [ ] Публичная бета (1000 пользователей)

### 🚀 Phase 4: Launch (Недели 13+)
- [ ] App Store / Google Play публикация
- [ ] Маркетинговая кампания
- [ ] Масштабирование инфраструктуры
- [ ] Advanced AR features (Cloud Anchors)
- [ ] Web dashboard для бизнесов

---

## 🎯 Целевые метрики

### MVP (3 месяца)
- 1,000 активных пользователей
- 10 партнерских бизнесов
- 30% catch rate
- 50% usage rate

### Год 1
- 50,000 пользователей
- 200 бизнесов
- $50,000 MRR
- Expansion в 3 города

---

## 💼 Бизнес модель

### Для пользователей
- ✅ Бесплатно
- ✅ Без подписки
- ✅ Реальные скидки

### Для бизнесов

| Тариф | Цена | Купоны | Фичи |
|-------|------|--------|------|
| **Basic** | $99/мес | 50/мес | Common купоны |
| **Premium** | $299/мес | 150/мес | Rare + аналитика |
| **Enterprise** | $999/мес | ∞ | Все типы + API |

---

## 🏗️ Технические требования

### Минимальные требования устройств

**iOS:**
- iPhone 6S или новее
- iOS 13.0+
- ARKit support

**Android:**
- [ARCore compatible device](https://developers.google.com/ar/devices)
- Android 8.0+
- 2GB RAM минимум

**Сервер:**
- Node.js 18+
- PostgreSQL 14+
- 4GB RAM
- 20GB SSD

---

## 🤝 Как внести вклад

Мы приветствуем вклад в проект! Вот как вы можете помочь:

1. 🐛 Сообщайте о багах через [Issues](https://github.com/your-repo/issues)
2. 💡 Предлагайте новые фичи
3. 📝 Улучшайте документацию
4. 🔧 Отправляйте Pull Requests

### Разработка

```bash
# Clone репозиторий
git clone https://github.com/your-repo/KuponGo.git

# Создать feature branch
git checkout -b feature/amazing-feature

# Commit изменения
git commit -m "Add amazing feature"

# Push
git push origin feature/amazing-feature

# Создать Pull Request
```

---

## 🐛 Известные проблемы

- WebXR демо не работает на iOS Safari (ограничение платформы)
- AR performance issues на устройствах с <3GB RAM
- GPS drift в помещениях

[Полный список](https://github.com/your-repo/issues)

---

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. [LICENSE](LICENSE) файл.

---

## 👥 Команда

- **Game Design** - [@username]
- **Backend** - [@username]
- **Flutter** - [@username]
- **3D Artist** - [@username]

---

## 📞 Контакты

- **Email**: contact@kupongo.app
- **Telegram**: [@kupongo_support]
- **Twitter**: [@KuponGoApp]
- **Discord**: [KuponGo Community](#)

---

## 🌟 Поддержите проект

Если вам нравится проект - поставьте ⭐!

---

<div align="center">

**Сделано с ❤️ командой KuponGo**

[Сайт](#) • [Документация](#) • [Blog](#) • [Community](#)

</div>
