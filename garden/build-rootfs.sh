#!/bin/bash
# Build rootfs images for GardenLiminal containers
# Creates minimal Alpine Linux based rootfs for each service

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOTFS_DIR="${PROJECT_ROOT}/garden/rootfs"
ALPINE_VERSION="3.19"
ALPINE_MIRROR="https://dl-cdn.alpinelinux.org/alpine"

# Build base Alpine rootfs
build_base_rootfs() {
    local target_dir=$1
    local name=$2

    log_info "Создание базового Alpine rootfs для $name..."

    mkdir -p "$target_dir"
    cd "$target_dir"

    # Download Alpine minirootfs
    local arch="x86_64"
    local rootfs_url="${ALPINE_MIRROR}/v${ALPINE_VERSION}/releases/${arch}/alpine-minirootfs-${ALPINE_VERSION}.0-${arch}.tar.gz"

    if [[ ! -f "alpine-rootfs.tar.gz" ]]; then
        log_info "Скачивание Alpine minirootfs..."
        curl -L -o alpine-rootfs.tar.gz "$rootfs_url"
    fi

    # Extract rootfs
    log_info "Распаковка rootfs..."
    sudo tar xzf alpine-rootfs.tar.gz

    # Setup basic directories
    sudo mkdir -p {dev,proc,sys,tmp,var/log,var/run}
    sudo chmod 1777 tmp

    # Create basic device nodes
    sudo mknod -m 666 dev/null c 1 3 || true
    sudo mknod -m 666 dev/zero c 1 5 || true
    sudo mknod -m 666 dev/random c 1 8 || true
    sudo mknod -m 666 dev/urandom c 1 9 || true

    # Setup DNS
    echo "nameserver 8.8.8.8" | sudo tee etc/resolv.conf > /dev/null

    log_success "Базовый rootfs создан для $name"
}

# Build LiminalDB rootfs
build_liminaldb_rootfs() {
    local rootfs_dir="${ROOTFS_DIR}/liminaldb"

    log_info "Сборка LiminalDB rootfs..."

    # Build base
    build_base_rootfs "$rootfs_dir" "LiminalDB"

    # Enter chroot and install dependencies
    log_info "Установка зависимостей..."
    sudo chroot "$rootfs_dir" /bin/sh <<'CHROOT_SCRIPT'
set -e
apk update
apk add --no-cache \
    ca-certificates \
    libgcc \
    openssl \
    curl

# Create user
addgroup -g 1000 liminal
adduser -D -u 1000 -G liminal liminal

# Create data directory
mkdir -p /data/liminaldb
chown -R liminal:liminal /data/liminaldb
CHROOT_SCRIPT

    # Clone and build LiminalDB
    log_info "Сборка LiminalDB binary..."
    local temp_dir="/tmp/liminaldb-build"
    mkdir -p "$temp_dir"
    cd "$temp_dir"

    if [[ ! -d "LiminalBD" ]]; then
        git clone https://github.com/safal207/LiminalBD
    fi

    cd LiminalBD
    cargo build --release

    # Copy binary to rootfs
    sudo cp target/release/liminaldb "${rootfs_dir}/usr/local/bin/"
    sudo chmod +x "${rootfs_dir}/usr/local/bin/liminaldb"

    log_success "LiminalDB rootfs готов: $rootfs_dir"
}

# Build Node.js backend rootfs
build_backend_rootfs() {
    local rootfs_dir="${ROOTFS_DIR}/backend"

    log_info "Сборка Backend rootfs..."

    # Build base
    build_base_rootfs "$rootfs_dir" "Backend"

    # Install Node.js and dependencies
    sudo chroot "$rootfs_dir" /bin/sh <<'CHROOT_SCRIPT'
set -e
apk update
apk add --no-cache \
    nodejs \
    npm \
    ca-certificates \
    curl

# Create user
addgroup -g 1000 node
adduser -D -u 1000 -G node node

# Create app directory
mkdir -p /app
chown -R node:node /app
CHROOT_SCRIPT

    # Copy backend code
    log_info "Копирование backend приложения..."
    sudo mkdir -p "${rootfs_dir}/app/backend"
    sudo cp -r "${PROJECT_ROOT}/backend"/* "${rootfs_dir}/app/backend/"

    # Install npm dependencies in chroot
    sudo chroot "$rootfs_dir" /bin/sh -c "cd /app/backend && npm install --production"
    sudo chown -R 1000:1000 "${rootfs_dir}/app"

    log_success "Backend rootfs готов: $rootfs_dir"
}

# Build WebXR rootfs
build_webxr_rootfs() {
    local rootfs_dir="${ROOTFS_DIR}/webxr"

    log_info "Сборка WebXR rootfs..."

    # Build base
    build_base_rootfs "$rootfs_dir" "WebXR"

    # Install Node.js and http-server
    sudo chroot "$rootfs_dir" /bin/sh <<'CHROOT_SCRIPT'
set -e
apk update
apk add --no-cache \
    nodejs \
    npm \
    ca-certificates

# Install http-server globally
npm install -g http-server

# Create user
addgroup -g 1000 www
adduser -D -u 1000 -G www www

mkdir -p /app
chown -R www:www /app
CHROOT_SCRIPT

    # Copy WebXR demo files
    log_info "Копирование WebXR файлов..."
    sudo mkdir -p "${rootfs_dir}/app/webxr-demo"
    sudo cp -r "${PROJECT_ROOT}/webxr-demo"/* "${rootfs_dir}/app/webxr-demo/"
    sudo chown -R 1000:1000 "${rootfs_dir}/app"

    log_success "WebXR rootfs готов: $rootfs_dir"
}

# Cleanup function
cleanup() {
    log_info "Очистка временных файлов..."
    find "${ROOTFS_DIR}" -name "*.tar.gz" -delete 2>/dev/null || true
}

# Main
main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════╗"
    echo "║  KuponGo RootFS Builder for GardenLiminal        ║"
    echo "╚═══════════════════════════════════════════════════╝"
    echo ""

    if [[ $EUID -ne 0 ]]; then
        log_error "Этот скрипт требует sudo привилегии"
        echo "Запустите: sudo $0"
        exit 1
    fi

    case "${1:-all}" in
        liminaldb)
            build_liminaldb_rootfs
            ;;
        backend)
            build_backend_rootfs
            ;;
        webxr)
            build_webxr_rootfs
            ;;
        all)
            build_liminaldb_rootfs
            echo ""
            build_backend_rootfs
            echo ""
            build_webxr_rootfs
            echo ""
            cleanup
            ;;
        clean)
            log_info "Удаление всех rootfs..."
            rm -rf "${ROOTFS_DIR}"/{liminaldb,backend,webxr}
            log_success "Rootfs удалены"
            ;;
        *)
            echo "Usage: sudo $0 {all|liminaldb|backend|webxr|clean}"
            echo ""
            echo "Commands:"
            echo "  all        - Build all rootfs images"
            echo "  liminaldb  - Build only LiminalDB rootfs"
            echo "  backend    - Build only Backend rootfs"
            echo "  webxr      - Build only WebXR rootfs"
            echo "  clean      - Remove all rootfs"
            exit 1
            ;;
    esac

    echo ""
    log_success "Готово! RootFS образы находятся в: $ROOTFS_DIR"
    echo ""
}

main "$@"
