# KuponGo - Docker Deployment Guide

## Обзор

KuponGo использует Docker для простого развертывания всех компонентов:

- **LiminalDB** - живая база данных (Rust)
- **Backend API** - REST API сервер (Node.js)
- **WebXR Demo** - браузерная AR демонстрация (Node.js)
- **Nginx** - reverse proxy

## Быстрый старт

### 1. Установить Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sudo sh

# Mac/Windows
# Установите Docker Desktop с официального сайта
```

### 2. Клонировать репозиторий

```bash
git clone https://github.com/safal207/KuponGo.git
cd KuponGo
```

### 3. Создать .env файл

```bash
cp backend/.env.example .env
```

Отредактируйте `.env`:
```env
JWT_SECRET=your_super_secret_jwt_key_here
LIMINALDB_SECRET=your_liminaldb_secret_here
```

### 4. Запустить все сервисы

```bash
docker-compose up -d
```

Это запустит:
- LiminalDB на порту 8787
- Backend API на порту 5000
- WebXR Demo на порту 3000
- Nginx на портах 80/443

### 5. Проверить статус

```bash
docker-compose ps
```

Должны видеть:
```
NAME                    STATUS              PORTS
kupongo-liminaldb       Up (healthy)        0.0.0.0:8787->8787/tcp
kupongo-backend         Up (healthy)        0.0.0.0:5000->5000/tcp
kupongo-webxr           Up (healthy)        0.0.0.0:3000->3000/tcp
kupongo-nginx           Up                  0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

## Доступ к сервисам

### Локально

- **WebXR Demo**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **LiminalDB WebSocket**: ws://localhost:8787
- **API Health**: http://localhost:5000/health

### С доменами (Nginx)

Настройте DNS записи:
- `demo.kupongo.app` → ваш IP
- `api.kupongo.app` → ваш IP
- `db.kupongo.app` → ваш IP

## Управление сервисами

### Остановить все

```bash
docker-compose down
```

### Пересобрать образы

```bash
docker-compose build
```

### Посмотреть логи

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f liminaldb
```

### Перезапустить сервис

```bash
docker-compose restart backend
```

### Масштабирование Backend

```bash
docker-compose up -d --scale backend=3
```

## Инициализация LiminalDB

### Создать namespace и API ключ

```bash
# Войти в контейнер LiminalDB
docker exec -it kupongo-liminaldb /bin/sh

# Запустить CLI
/app/liminal-cli
```

В CLI выполните:
```
:ns create alpha
:key add {"id":"kupongo-api-prod","secret":"your_secret","role":"Writer","ns":"alpha"}
:quota set {"ns":"alpha","rps":500,"burst":1000,"max_cells":10000}
```

Или через WebSocket (JavaScript):
```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8787');

ws.on('open', () => {
  // Создать namespace
  ws.send(JSON.stringify({cmd: "ns.create", ns: "alpha"}));

  // Добавить ключ
  ws.send(JSON.stringify({
    cmd: "key.add",
    key: {
      id: "kupongo-api-prod",
      secret: "your_secret_here",
      role: "Writer",
      ns: "alpha"
    }
  }));

  // Установить квоту
  ws.send(JSON.stringify({
    cmd: "quota.set",
    ns: "alpha",
    q: {
      rps: 500,
      burst: 1000,
      max_cells: 10000,
      max_views: 100
    }
  }));
});
```

## Production Deployment

### 1. Использовать Docker Swarm или Kubernetes

```bash
# Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml kupongo

# Kubernetes
kubectl apply -f k8s/
```

### 2. Настроить SSL (Let's Encrypt)

```bash
# Установить certbot
apt-get install certbot python3-certbot-nginx

# Получить сертификат
certbot --nginx -d kupongo.app -d api.kupongo.app -d demo.kupongo.app
```

### 3. Мониторинг

Добавить в `docker-compose.yml`:

```yaml
  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  # Grafana
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

### 4. Бэкапы

```bash
# Бэкап LiminalDB данных
docker exec kupongo-liminaldb tar czf /tmp/backup.tar.gz /app/data
docker cp kupongo-liminaldb:/tmp/backup.tar.gz ./backups/

# Восстановление
docker cp ./backups/backup.tar.gz kupongo-liminaldb:/tmp/
docker exec kupongo-liminaldb tar xzf /tmp/backup.tar.gz -C /app/
```

## Переменные окружения

### Backend (.env)

```env
NODE_ENV=production
PORT=5000

# LiminalDB
LIMINALDB_URL=ws://liminaldb:8787
LIMINALDB_NAMESPACE=alpha
LIMINALDB_KEY_ID=kupongo-api-prod
LIMINALDB_SECRET=your_secret_here

# JWT
JWT_SECRET=your_jwt_secret_here

# Google Maps (опционально)
GOOGLE_MAPS_API_KEY=your_api_key

# Firebase (опционально)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

## Ограничения ресурсов

Добавить в `docker-compose.yml`:

```yaml
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Troubleshooting

### LiminalDB не запускается

```bash
# Проверить логи
docker-compose logs liminaldb

# Проверить порт
netstat -tulpn | grep 8787

# Пересобрать образ
docker-compose build --no-cache liminaldb
```

### Backend не подключается к LiminalDB

```bash
# Проверить сеть
docker network inspect kupongo-network

# Проверить DNS
docker exec kupongo-backend ping liminaldb

# Проверить переменные окружения
docker exec kupongo-backend env | grep LIMINALDB
```

### Высокая нагрузка

```bash
# Посмотреть статистику
docker stats

# Масштабировать backend
docker-compose up -d --scale backend=5

# Добавить кеш (Redis)
```

## Обновление

```bash
# Получить новый код
git pull origin main

# Пересобрать и перезапустить
docker-compose down
docker-compose build
docker-compose up -d

# Проверить
docker-compose ps
```

## Удаление

```bash
# Остановить и удалить контейнеры
docker-compose down

# Удалить volumes (ОСТОРОЖНО - удалит данные!)
docker-compose down -v

# Удалить образы
docker rmi kupongo-backend kupongo-webxr kupongo-liminaldb
```

---

## Cloud Deployment

### AWS (Elastic Beanstalk)

```bash
eb init kupongo
eb create kupongo-prod
eb deploy
```

### Google Cloud (Cloud Run)

```bash
gcloud run deploy kupongo-backend \
  --image gcr.io/PROJECT_ID/kupongo-backend \
  --platform managed \
  --region us-central1
```

### DigitalOcean (App Platform)

```bash
doctl apps create --spec app-spec.yaml
```

### Railway

```bash
railway up
```

---

**Вопросы?** Создайте Issue на GitHub: https://github.com/safal207/KuponGo/issues
