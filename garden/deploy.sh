#!/bin/bash
# KuponGo deployment script using GardenLiminal
# Experimental alternative to Docker

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GARDEN_BIN="${GARDEN_BIN:-gl}"
GARDEN_REPO="https://github.com/safal207/GardenLiminal"
GARDEN_DIR="/tmp/garden-liminal"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GARDEN_CONFIG_DIR="${PROJECT_ROOT}/garden"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Linux
check_linux() {
    if [[ "$(uname -s)" != "Linux" ]]; then
        log_error "GardenLiminal требует Linux. Текущая ОС: $(uname -s)"
        exit 1
    fi
    log_success "Запуск на Linux"
}

# Check kernel version (needs 5.10+)
check_kernel() {
    local kernel_version=$(uname -r | cut -d. -f1-2)
    local major=$(echo $kernel_version | cut -d. -f1)
    local minor=$(echo $kernel_version | cut -d. -f2)

    if [[ $major -lt 5 ]] || [[ $major -eq 5 && $minor -lt 10 ]]; then
        log_error "Требуется Linux kernel 5.10+. Текущая версия: $(uname -r)"
        exit 1
    fi
    log_success "Kernel версия: $(uname -r) ✓"
}

# Check if user namespaces are enabled
check_user_namespaces() {
    if [[ ! -f /proc/sys/kernel/unprivileged_userns_clone ]]; then
        log_warning "User namespaces могут быть не включены"
        return
    fi

    local enabled=$(cat /proc/sys/kernel/unprivileged_userns_clone)
    if [[ $enabled -eq 0 ]]; then
        log_error "User namespaces отключены. Включите: sysctl kernel.unprivileged_userns_clone=1"
        exit 1
    fi
    log_success "User namespaces включены ✓"
}

# Install GardenLiminal if not present
install_garden() {
    if command -v $GARDEN_BIN &> /dev/null; then
        log_success "GardenLiminal уже установлен: $(which $GARDEN_BIN)"
        return
    fi

    log_info "GardenLiminal не найден, начинаем установку..."

    # Check if Rust is installed
    if ! command -v cargo &> /dev/null; then
        log_error "Rust не установлен. Установите: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        exit 1
    fi

    # Clone repository
    log_info "Клонирование GardenLiminal..."
    if [[ -d "$GARDEN_DIR" ]]; then
        rm -rf "$GARDEN_DIR"
    fi
    git clone "$GARDEN_REPO" "$GARDEN_DIR"

    # Build
    log_info "Сборка GardenLiminal (это займет несколько минут)..."
    cd "$GARDEN_DIR"
    cargo build --release

    # Install binary
    sudo cp target/release/gl /usr/local/bin/
    sudo chmod +x /usr/local/bin/gl

    log_success "GardenLiminal установлен: /usr/local/bin/gl"
    cd "$PROJECT_ROOT"
}

# Prepare directories
prepare_directories() {
    log_info "Подготовка директорий..."

    sudo mkdir -p /var/lib/kupongo/{liminaldb-data,backend-logs,logs}
    sudo chown -R $(id -u):$(id -g) /var/lib/kupongo

    mkdir -p "${GARDEN_CONFIG_DIR}/rootfs"/{liminaldb,backend,webxr}

    log_success "Директории подготовлены"
}

# Build rootfs for containers
build_rootfs() {
    log_info "Подготовка rootfs для контейнеров..."

    # LiminalDB rootfs
    if [[ ! -d "${GARDEN_CONFIG_DIR}/rootfs/liminaldb/usr/local/bin" ]]; then
        log_info "Сборка LiminalDB rootfs..."
        # TODO: Clone and build LiminalDB
        log_warning "LiminalDB rootfs требует ручной подготовки"
    fi

    # Backend rootfs (Node.js)
    if [[ ! -d "${GARDEN_CONFIG_DIR}/rootfs/backend/usr/local/bin" ]]; then
        log_info "Подготовка Node.js rootfs для backend..."
        log_warning "Backend rootfs требует ручной подготовки"
    fi

    # WebXR rootfs (Node.js + http-server)
    if [[ ! -d "${GARDEN_CONFIG_DIR}/rootfs/webxr/usr/local/bin" ]]; then
        log_info "Подготовка Node.js rootfs для webxr..."
        log_warning "WebXR rootfs требует ручной подготовки"
    fi
}

# Validate seed configurations
validate_seeds() {
    log_info "Валидация Seed конфигураций..."

    cd "$GARDEN_CONFIG_DIR"

    for seed in seeds/*.yaml; do
        if [[ -f "$seed" ]]; then
            log_info "Проверка $seed..."
            $GARDEN_BIN inspect -f "$seed" || {
                log_error "Ошибка валидации $seed"
                exit 1
            }
        fi
    done

    log_success "Все Seed конфигурации валидны ✓"
}

# Start individual container
start_container() {
    local seed_file=$1
    local container_name=$2

    log_info "Запуск контейнера: $container_name"

    sudo $GARDEN_BIN run \
        -f "$seed_file" \
        --store liminaldb \
        --detach \
        --name "$container_name" || {
        log_error "Не удалось запустить $container_name"
        return 1
    }

    log_success "$container_name запущен ✓"
}

# Start all containers in Pod
start_pod() {
    log_info "Запуск KuponGo Pod..."

    cd "$GARDEN_CONFIG_DIR"

    # Run Pod (если GardenLiminal поддерживает Pod API)
    if $GARDEN_BIN run -f kupongo-pod.yaml --store liminaldb 2>/dev/null; then
        log_success "KuponGo Pod запущен ✓"
    else
        log_warning "Pod API не поддерживается, запускаем контейнеры по отдельности..."

        # Start containers in dependency order
        start_container "seeds/liminaldb.yaml" "kupongo-liminaldb"
        sleep 5  # Wait for LiminalDB to initialize

        start_container "seeds/backend.yaml" "kupongo-backend"
        sleep 3

        start_container "seeds/webxr.yaml" "kupongo-webxr"
    fi
}

# Show status
show_status() {
    log_info "Статус KuponGo контейнеров:"
    echo ""

    # TODO: Use GardenLiminal status command
    log_info "LiminalDB: ws://localhost:8787"
    log_info "Backend API: http://localhost:3000"
    log_info "WebXR Demo: http://localhost:8080"
    echo ""

    log_success "KuponGo запущен!"
}

# Stop all containers
stop_all() {
    log_info "Остановка всех контейнеров..."

    # TODO: Use GardenLiminal stop command
    sudo pkill -f "gl run" || true

    log_success "Все контейнеры остановлены"
}

# Main deployment flow
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════╗"
    echo "║  KuponGo Deployment with GardenLiminal           ║"
    echo "║  Experimental lightweight container runtime       ║"
    echo "╚═══════════════════════════════════════════════════╝"
    echo ""

    # Parse arguments
    case "${1:-deploy}" in
        deploy)
            check_linux
            check_kernel
            check_user_namespaces
            install_garden
            prepare_directories
            build_rootfs
            validate_seeds
            start_pod
            show_status
            ;;
        stop)
            stop_all
            ;;
        status)
            show_status
            ;;
        validate)
            validate_seeds
            ;;
        *)
            echo "Usage: $0 {deploy|stop|status|validate}"
            echo ""
            echo "Commands:"
            echo "  deploy    - Deploy KuponGo with GardenLiminal"
            echo "  stop      - Stop all containers"
            echo "  status    - Show container status"
            echo "  validate  - Validate Seed configurations"
            exit 1
            ;;
    esac
}

main "$@"
