# GardenLiminal Deployment Guide

**Экспериментальный деплой KuponGo через GardenLiminal - легковесный контейнерный runtime на Rust**

---

## 📋 Содержание

1. [Введение](#введение)
2. [Что такое GardenLiminal](#что-такое-gardenliminal)
3. [Преимущества перед Docker](#преимущества-перед-docker)
4. [Системные требования](#системные-требования)
5. [Быстрый старт](#быстрый-старт)
6. [Архитектура](#архитектура)
7. [Детальная инструкция](#детальная-инструкция)
8. [Управление контейнерами](#управление-контейнерами)
9. [Мониторинг и логирование](#мониторинг-и-логирование)
10. [Troubleshooting](#troubleshooting)

---

## Введение

GardenLiminal (кодовое имя **Codex**) - это экспериментальный минималистичный контейнерный runtime, написанный на Rust. Он использует нативные Linux примитивы (namespaces, cgroups v2, seccomp) для изоляции процессов и интегрируется с LiminalDB для структурированного логирования событий.

### Зачем использовать GardenLiminal вместо Docker?

- **Легковесность**: Меньше кода, меньше зависимостей
- **Полный контроль**: Прямое управление Linux изоляцией
- **Интеграция с LiminalDB**: События контейнеров автоматически логируются в живую базу данных
- **Образовательная ценность**: Понимание внутренностей контейнеризации
- **Экспериментальность**: Возможность кастомизации и изучения новых подходов

---

## Что такое GardenLiminal

### Основные возможности

**Iteration 1: Базовая изоляция**
- ✅ Namespace isolation (user, pid, uts, ipc, mnt, net)
- ✅ Resource limits через cgroups v2 (CPU, memory, PIDs)
- ✅ UID/GID mapping для безопасности
- ✅ Structured JSON event logging
- ✅ No new privileges enforcement

**Iteration 2: Продвинутые функции**
- ✅ Pod поддержка (multi-container groups)
- ✅ OverlayFS для layered filesystems
- ✅ Network isolation с bridge + veth pairs
- ✅ Security policies (Pacts)
- ✅ Metrics collection (CPU, memory, PIDs)
- ✅ Restart policies (Never/OnFailure/Always)

### Архитектурные слои

```
┌─────────────────────────────────────┐
│  CLI Commands (inspect, run)        │
├─────────────────────────────────────┤
│  Config Parser (Seed YAML)          │
├─────────────────────────────────────┤
│  Isolation Layer                    │
│  - Namespace management             │
│  - Rootfs mounting                  │
│  - Cgroups control                  │
│  - Capability dropping              │
├─────────────────────────────────────┤
│  Execution Layer                    │
│  - Fork/exec cycle                  │
│  - Process monitoring               │
├─────────────────────────────────────┤
│  Event Store                        │
│  - JSON structured logging          │
│  - LiminalDB adapter                │
└─────────────────────────────────────┘
```

---

## Преимущества перед Docker

| Критерий | GardenLiminal | Docker |
|----------|---------------|--------|
| **Размер бинарника** | ~5-10 MB | ~100+ MB |
| **Запуск контейнера** | ~50-100ms | ~200-500ms |
| **Оверхед памяти** | Минимальный | Daemon + containerd |
| **Конфигурация** | Простой YAML | Dockerfile + compose |
| **Интеграция LiminalDB** | Нативная | Требует драйвера |
| **Контроль изоляции** | Полный | Абстрагирован |
| **Зрелость** | MVP / Экспериментальный | Production-ready |
| **Ecosystem** | Ограниченный | Огромный |

**Вывод**: GardenLiminal не замена Docker для production, но отличный выбор для:
- Экспериментальных проектов
- Обучения контейнеризации
- Специализированных сценариев с LiminalDB
- Минимизации оверхеда в ресурсо-ограниченных средах

---

## Системные требования

### Обязательные

- **ОС**: Linux (kernel 5.10+)
- **Архитектура**: x86_64, ARM64
- **User namespaces**: Должны быть включены
- **Cgroups v2**: Должны быть доступны
- **Rust**: 1.70+ (для сборки)
- **Права**: `sudo` для некоторых операций

### Рекомендуемые

- **CPU**: 2+ cores
- **RAM**: 4+ GB
- **Диск**: 10+ GB свободного места
- **Network**: Интернет для скачивания зависимостей

### Проверка совместимости

```bash
# Проверка версии ядра
uname -r  # Должно быть >= 5.10

# Проверка user namespaces
cat /proc/sys/kernel/unprivileged_userns_clone  # Должно быть 1

# Проверка cgroups v2
mount | grep cgroup2  # Должен показать cgroup2 mount

# Проверка Rust
cargo --version  # Должно быть >= 1.70
```

---

## Быстрый старт

### 1. Установка зависимостей

```bash
# Установка Rust (если еще не установлен)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Включение user namespaces (если отключены)
sudo sysctl kernel.unprivileged_userns_clone=1

# Установка дополнительных утилит
sudo apt update
sudo apt install -y git curl build-essential
```

### 2. Автоматический деплой

```bash
cd /home/user/KuponGo

# Деплой всего стека одной командой
./garden/deploy.sh deploy
```

Скрипт автоматически:
1. ✅ Проверит системные требования
2. ✅ Установит GardenLiminal (если нужно)
3. ✅ Подготовит директории
4. ✅ Соберет rootfs образы
5. ✅ Валидирует Seed конфигурации
6. ✅ Запустит Pod с тремя контейнерами

### 3. Проверка статуса

```bash
# Проверка запущенных контейнеров
./garden/deploy.sh status

# Должно показать:
# LiminalDB: ws://localhost:8787
# Backend API: http://localhost:3000
# WebXR Demo: http://localhost:8080
```

### 4. Тестирование

```bash
# Тест LiminalDB
curl http://localhost:8787/health

# Тест Backend API
curl http://localhost:3000/health

# Тест WebXR (открыть в браузере)
xdg-open http://localhost:8080
```

---

## Архитектура

### Структура проекта

```
KuponGo/
├── garden/
│   ├── seeds/                  # Seed конфигурации для контейнеров
│   │   ├── liminaldb.yaml      # LiminalDB сервер
│   │   ├── backend.yaml        # Node.js Backend API
│   │   └── webxr.yaml          # WebXR статический сервер
│   ├── rootfs/                 # RootFS образы
│   │   ├── liminaldb/          # Alpine + LiminalDB binary
│   │   ├── backend/            # Alpine + Node.js + app
│   │   └── webxr/              # Alpine + Node.js + http-server
│   ├── kupongo-pod.yaml        # Pod конфигурация (multi-container)
│   ├── deploy.sh               # Скрипт автоматического деплоя
│   └── build-rootfs.sh         # Сборка rootfs образов
```

### Сетевая топология

```
┌─────────────────────────────────────────────────────────┐
│  Host Network (0.0.0.0)                                 │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Bridge: gl0 (10.44.0.1/24)                       │ │
│  │                                                   │ │
│  │  ┌──────────────────────────────────────────────┐│ │
│  │  │  Pod: kupongo-stack (10.44.0.10)            ││ │
│  │  │  Shared Network Namespace                    ││ │
│  │  │                                              ││ │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌───────┤│ │
│  │  │  │ LiminalDB   │  │ Backend     │  │WebXR  ││ │
│  │  │  │ :8787       │  │ :3000       │  │:8080  ││ │
│  │  │  └─────────────┘  └─────────────┘  └───────┘│ │
│  │  └──────────────────────────────────────────────┘│ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Port Forwarding:                                       │
│  8787 → 10.44.0.10:8787 (LiminalDB WebSocket)          │
│  3000 → 10.44.0.10:3000 (Backend HTTP)                 │
│  8080 → 10.44.0.10:8080 (WebXR HTTP)                   │
└─────────────────────────────────────────────────────────┘
```

### Зависимости контейнеров

```
LiminalDB (Priority: 100)
    ↓
Backend API (Priority: 50)
    ↓
WebXR Demo (Priority: 10)
```

---

## Детальная инструкция

### Шаг 1: Установка GardenLiminal

#### Вариант A: Автоматическая установка (рекомендуется)

```bash
./garden/deploy.sh deploy
# Автоматически установит GardenLiminal в /usr/local/bin/gl
```

#### Вариант B: Ручная установка

```bash
# Клонирование репозитория
git clone https://github.com/safal207/GardenLiminal /tmp/garden-liminal
cd /tmp/garden-liminal

# Сборка
cargo build --release

# Установка
sudo cp target/release/gl /usr/local/bin/
sudo chmod +x /usr/local/bin/gl

# Проверка
gl --version
```

### Шаг 2: Подготовка RootFS образов

RootFS - это минимальная файловая система для каждого контейнера.

```bash
# Сборка всех rootfs образов
sudo ./garden/build-rootfs.sh all

# Или по отдельности:
sudo ./garden/build-rootfs.sh liminaldb
sudo ./garden/build-rootfs.sh backend
sudo ./garden/build-rootfs.sh webxr
```

**Что делает скрипт:**
1. Скачивает Alpine Linux minirootfs (3.19)
2. Распаковывает базовую FS
3. Устанавливает зависимости (Node.js, Rust, etc)
4. Копирует приложения
5. Создает пользователей с UID/GID 1000

**Размеры rootfs:**
- LiminalDB: ~100-150 MB (Alpine + Rust runtime + binary)
- Backend: ~200-250 MB (Alpine + Node.js + npm packages)
- WebXR: ~150-200 MB (Alpine + Node.js + http-server)

### Шаг 3: Валидация конфигураций

```bash
# Валидация всех Seed файлов
./garden/deploy.sh validate

# Или вручную для каждого:
gl inspect -f garden/seeds/liminaldb.yaml
gl inspect -f garden/seeds/backend.yaml
gl inspect -f garden/seeds/webxr.yaml
```

**Валидация проверяет:**
- Синтаксис YAML
- Наличие обязательных полей
- Корректность путей
- Ресурсные лимиты
- Security политики

### Шаг 4: Запуск контейнеров

#### Вариант A: Через Pod (если поддерживается)

```bash
cd garden

# Запуск Pod
sudo gl run -f kupongo-pod.yaml --store liminaldb

# Pod запустит все 3 контейнера в правильном порядке
# с shared network namespace
```

#### Вариант B: Раздельный запуск (fallback)

```bash
# 1. Запуск LiminalDB
sudo gl run \
    -f seeds/liminaldb.yaml \
    --store mem \
    --detach \
    --name kupongo-liminaldb

# Ждем инициализации
sleep 5

# 2. Запуск Backend
sudo gl run \
    -f seeds/backend.yaml \
    --store liminaldb \
    --detach \
    --name kupongo-backend

sleep 3

# 3. Запуск WebXR
sudo gl run \
    -f seeds/webxr.yaml \
    --store liminaldb \
    --detach \
    --name kupongo-webxr
```

### Шаг 5: Инициализация LiminalDB

После запуска контейнеров инициализируйте LiminalDB:

```bash
# Подключение к LiminalDB через WebSocket
# (используя kupongo_adapter.js из backend)

cd backend/src/database

# Создание namespace и API ключа
node -e "
const LiminalClient = require('./liminal_client.js');
const client = new LiminalClient('ws://localhost:8787');
client.connect().then(async () => {
  // Создание namespace
  await client.push({
    k: 1,
    p: 'ns/kupongo',
    s: 1.0,
    meta: { created: Date.now() }
  });

  // Создание API ключа
  await client.push({
    k: 2,
    p: 'auth/api-key/kupongo-api-key-2024',
    s: 0.9,
    tg: ['auth', 'api-key'],
    meta: { permissions: ['read', 'write'] }
  });

  console.log('✓ LiminalDB initialized');
  client.close();
});
"
```

---

## Управление контейнерами

### Просмотр статуса

```bash
# Через deploy script
./garden/deploy.sh status

# Вручную через процессы
ps aux | grep "gl run"

# Логи (если GardenLiminal поддерживает)
# TODO: gl logs <container-name>
```

### Остановка контейнеров

```bash
# Через deploy script
./garden/deploy.sh stop

# Вручную
sudo pkill -f "gl run"
```

### Рестарт отдельного контейнера

```bash
# Остановить
sudo pkill -f "kupongo-backend"

# Запустить заново
cd garden
sudo gl run -f seeds/backend.yaml --store liminaldb --detach --name kupongo-backend
```

### Exec в контейнер (для отладки)

```bash
# Если GardenLiminal поддерживает exec:
sudo gl exec kupongo-backend /bin/sh

# Или найти PID и использовать nsenter:
PID=$(pgrep -f "kupongo-backend")
sudo nsenter -t $PID -m -u -i -n -p /bin/sh
```

---

## Мониторинг и логирование

### Метрики контейнеров

Все контейнеры настроены на сбор метрик каждые 30 секунд:

```yaml
monitoring:
  enabled: true
  interval: 30
  metrics:
    - "memory.usage"
    - "cpu.usage"
    - "pids.current"
```

**Просмотр метрик:**

```bash
# Через cgroups напрямую
cat /sys/fs/cgroup/<container-name>/memory.current
cat /sys/fs/cgroup/<container-name>/cpu.stat
cat /sys/fs/cgroup/<container-name>/pids.current
```

### Event logging в LiminalDB

Все события контейнеров логируются в LiminalDB:

```yaml
logging:
  driver: "liminaldb"
  endpoint: "ws://localhost:8787"
  namespace: "kupongo.logs.backend"
  format: "json"
```

**Запрос логов из LiminalDB:**

```javascript
// Используя LiminalDB client
const client = new LiminalClient('ws://localhost:8787');
await client.connect();

// Query последних 100 событий из backend
const logs = await client.lql(`
  query {
    pattern: "kupongo.logs.backend/*",
    limit: 100,
    sort: "-timestamp"
  }
`);

console.log(logs);
```

### Application логи

```bash
# LiminalDB логи
tail -f /var/lib/kupongo/logs/liminaldb.log

# Backend логи
tail -f /var/lib/kupongo/backend-logs/api.log

# WebXR логи
tail -f /var/lib/kupongo/logs/webxr.log
```

---

## Troubleshooting

### Проблема: User namespaces отключены

**Симптом:**
```
Error: failed to create user namespace: Operation not permitted
```

**Решение:**
```bash
# Включить user namespaces
sudo sysctl kernel.unprivileged_userns_clone=1

# Сделать постоянным
echo "kernel.unprivileged_userns_clone = 1" | sudo tee -a /etc/sysctl.conf
```

### Проблема: Cgroups v2 недоступны

**Симптом:**
```
Error: cgroup2 not mounted
```

**Решение:**
```bash
# Проверить mount
mount | grep cgroup2

# Если нет, примонтировать
sudo mkdir -p /sys/fs/cgroup
sudo mount -t cgroup2 none /sys/fs/cgroup

# Добавить в /etc/fstab для постоянства
echo "none /sys/fs/cgroup cgroup2 defaults 0 0" | sudo tee -a /etc/fstab
```

### Проблема: RootFS не найден

**Симптом:**
```
Error: rootfs path does not exist: /home/user/KuponGo/garden/rootfs/backend
```

**Решение:**
```bash
# Собрать rootfs образы
sudo ./garden/build-rootfs.sh all

# Проверить наличие
ls -la garden/rootfs/
```

### Проблема: LiminalDB не подключается

**Симптом:**
```
Backend logs: Error: connect ECONNREFUSED 127.0.0.1:8787
```

**Решение:**
```bash
# Проверить что LiminalDB запущен
ps aux | grep liminaldb

# Проверить порт
sudo netstat -tlnp | grep 8787

# Рестартовать LiminalDB контейнер
sudo pkill -f "kupongo-liminaldb"
cd garden
sudo gl run -f seeds/liminaldb.yaml --store mem --detach --name kupongo-liminaldb
```

### Проблема: Нехватка памяти

**Симптом:**
```
Error: OOM (out of memory)
Container killed by cgroup
```

**Решение:**

Увеличить лимиты в Seed файлах:

```yaml
# В seeds/backend.yaml
resources:
  limits:
    memory: "2Gi"  # Было 1Gi
```

Затем рестартовать контейнер.

### Проблема: Сетевая изоляция не работает

**Симптом:**
```
Containers can't reach each other
```

**Решение:**

```bash
# Проверить bridge
ip link show gl0

# Создать bridge вручную (если GardenLiminal не создал)
sudo ip link add name gl0 type bridge
sudo ip addr add 10.44.0.1/24 dev gl0
sudo ip link set gl0 up

# Включить IP forwarding
sudo sysctl net.ipv4.ip_forward=1
```

### Проблема: Permission denied при запуске

**Симптом:**
```
Error: permission denied
```

**Решение:**

```bash
# GardenLiminal требует sudo для некоторых операций
sudo gl run -f seeds/liminaldb.yaml ...

# Или добавить текущего пользователя в группу (если GardenLiminal поддерживает)
# sudo usermod -aG garden $USER
```

---

## Сравнение с Docker деплоем

| Операция | Docker | GardenLiminal |
|----------|--------|---------------|
| **Запуск** | `docker-compose up -d` | `./garden/deploy.sh deploy` |
| **Остановка** | `docker-compose down` | `./garden/deploy.sh stop` |
| **Статус** | `docker ps` | `./garden/deploy.sh status` |
| **Логи** | `docker logs <name>` | `tail -f /var/lib/kupongo/logs/` |
| **Exec** | `docker exec -it <name> sh` | `nsenter -t <pid> /bin/sh` |
| **Cleanup** | `docker system prune` | `sudo ./garden/build-rootfs.sh clean` |

---

## Дополнительные ресурсы

- **GardenLiminal репозиторий**: https://github.com/safal207/GardenLiminal
- **LiminalDB репозиторий**: https://github.com/safal207/LiminalBD
- **Linux Namespaces man**: `man 7 namespaces`
- **Cgroups v2 документация**: https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html

---

## Roadmap и будущие улучшения

- [ ] OCI image support (pull from Docker Hub)
- [ ] Storage drivers для persistent volumes
- [ ] Full Pod API implementation
- [ ] Health checks и liveness probes
- [ ] Service discovery между Pods
- [ ] Prometheus metrics exporter
- [ ] Web UI для мониторинга
- [ ] CI/CD интеграция

---

**Экспериментируйте и делитесь результатами!** 🚀

Если у вас возникли вопросы или предложения, создайте issue в репозитории GardenLiminal.
