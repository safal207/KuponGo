#!/bin/bash
# Benchmark script to compare Docker vs GardenLiminal deployments
# Measures: startup time, memory usage, CPU usage, response time, throughput

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESULTS_DIR="${PROJECT_ROOT}/benchmarks/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="${RESULTS_DIR}/comparison_${TIMESTAMP}.json"
REPORT_FILE="${RESULTS_DIR}/report_${TIMESTAMP}.md"

# Benchmark parameters
WARMUP_REQUESTS=10
BENCHMARK_REQUESTS=100
CONCURRENT_REQUESTS=10
TEST_DURATION=60 # seconds

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_section() { echo -e "\n${CYAN}=== $1 ===${NC}\n"; }

# Create results directory
mkdir -p "$RESULTS_DIR"

# Initialize results JSON
cat > "$RESULTS_FILE" <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "system": {
    "os": "$(uname -s)",
    "kernel": "$(uname -r)",
    "cpu": "$(nproc) cores",
    "memory": "$(free -h | awk '/^Mem:/ {print $2}')"
  },
  "docker": {},
  "gardenliminal": {}
}
EOF

# Measure container startup time
measure_startup_time() {
    local deployment_type=$1
    log_info "Measuring startup time for $deployment_type..."

    local start_time=$(date +%s%3N)

    if [[ $deployment_type == "docker" ]]; then
        cd "$PROJECT_ROOT"
        docker-compose up -d > /dev/null 2>&1

        # Wait for services to be healthy
        until docker-compose ps | grep -q "Up.*healthy" 2>/dev/null; do
            sleep 0.1
        done
    else
        cd "$PROJECT_ROOT/garden"
        sudo ./deploy.sh deploy > /dev/null 2>&1

        # Wait for services
        sleep 5
    fi

    local end_time=$(date +%s%3N)
    local startup_time=$((end_time - start_time))

    log_success "Startup time: ${startup_time}ms"
    echo $startup_time
}

# Measure memory usage
measure_memory() {
    local deployment_type=$1
    log_info "Measuring memory usage for $deployment_type..."

    sleep 5 # Let services settle

    if [[ $deployment_type == "docker" ]]; then
        # Docker memory usage
        local total_memory=$(docker stats --no-stream --format "{{.MemUsage}}" | awk -F'/' '{sum+=$1} END {print sum}')
    else
        # GardenLiminal memory usage (sum cgroup memory)
        local total_memory=$(ps aux | grep -E "gl run" | awk '{sum+=$6} END {print sum}')
    fi

    log_success "Memory usage: ${total_memory} KB"
    echo $total_memory
}

# Measure CPU usage
measure_cpu() {
    local deployment_type=$1
    log_info "Measuring CPU usage for $deployment_type..."

    if [[ $deployment_type == "docker" ]]; then
        local cpu_usage=$(docker stats --no-stream --format "{{.CPUPerc}}" | awk '{gsub(/%/,""); sum+=$1} END {print sum}')
    else
        local cpu_usage=$(ps aux | grep -E "gl run" | awk '{sum+=$3} END {print sum}')
    fi

    log_success "CPU usage: ${cpu_usage}%"
    echo $cpu_usage
}

# Measure API response time
measure_response_time() {
    local deployment_type=$1
    log_info "Measuring API response time for $deployment_type..."

    local endpoint="http://localhost:3000/health"
    local total_time=0

    # Warmup
    for i in $(seq 1 $WARMUP_REQUESTS); do
        curl -s "$endpoint" > /dev/null
    done

    # Actual measurements
    for i in $(seq 1 $BENCHMARK_REQUESTS); do
        local response_time=$(curl -o /dev/null -s -w '%{time_total}\n' "$endpoint")
        total_time=$(echo "$total_time + $response_time" | bc)
    done

    local avg_time=$(echo "scale=4; $total_time / $BENCHMARK_REQUESTS" | bc)
    local avg_ms=$(echo "$avg_time * 1000" | bc)

    log_success "Average response time: ${avg_ms}ms"
    echo $avg_ms
}

# Measure throughput (requests per second)
measure_throughput() {
    local deployment_type=$1
    log_info "Measuring throughput for $deployment_type..."

    if ! command -v ab &> /dev/null; then
        log_warning "Apache Bench (ab) not installed, using curl fallback"

        local start=$(date +%s)
        local count=0
        local endpoint="http://localhost:3000/health"

        for i in $(seq 1 $BENCHMARK_REQUESTS); do
            curl -s "$endpoint" > /dev/null && ((count++))
        done

        local end=$(date +%s)
        local duration=$((end - start))
        local rps=$(echo "scale=2; $count / $duration" | bc)
    else
        # Use Apache Bench
        local result=$(ab -n $BENCHMARK_REQUESTS -c $CONCURRENT_REQUESTS -q http://localhost:3000/health 2>&1)
        local rps=$(echo "$result" | grep "Requests per second" | awk '{print $4}')
    fi

    log_success "Throughput: ${rps} req/s"
    echo $rps
}

# Measure container count and sizes
measure_containers() {
    local deployment_type=$1
    log_info "Measuring container metrics for $deployment_type..."

    if [[ $deployment_type == "docker" ]]; then
        local count=$(docker-compose ps -q | wc -l)
        local size=$(docker-compose images | tail -n +2 | awk '{sum+=$NF} END {print sum}')
    else
        local count=$(ps aux | grep "gl run" | grep -v grep | wc -l)
        local size="N/A" # GardenLiminal doesn't use traditional images
    fi

    log_success "Container count: $count"
    log_success "Total size: $size"

    echo "$count:$size"
}

# Run comprehensive benchmark
run_benchmark() {
    local deployment_type=$1

    log_section "Benchmarking $deployment_type Deployment"

    # Stop any running deployments
    log_info "Cleaning up previous deployments..."
    if [[ $deployment_type == "docker" ]]; then
        docker-compose down > /dev/null 2>&1 || true
    else
        sudo pkill -f "gl run" || true
    fi
    sleep 2

    # Startup time
    local startup_time=$(measure_startup_time $deployment_type)

    # Memory usage
    local memory=$(measure_memory $deployment_type)

    # CPU usage
    local cpu=$(measure_cpu $deployment_type)

    # Response time
    local response_time=$(measure_response_time $deployment_type)

    # Throughput
    local throughput=$(measure_throughput $deployment_type)

    # Container metrics
    local container_metrics=$(measure_containers $deployment_type)
    local container_count=$(echo $container_metrics | cut -d: -f1)
    local total_size=$(echo $container_metrics | cut -d: -f2)

    # Save results to JSON
    local tmp_file=$(mktemp)
    jq ".${deployment_type} = {
        \"startup_time_ms\": $startup_time,
        \"memory_kb\": $memory,
        \"cpu_percent\": $cpu,
        \"response_time_ms\": $response_time,
        \"throughput_rps\": $throughput,
        \"container_count\": $container_count,
        \"total_size\": \"$total_size\"
    }" "$RESULTS_FILE" > "$tmp_file"
    mv "$tmp_file" "$RESULTS_FILE"

    # Cleanup
    log_info "Cleaning up..."
    if [[ $deployment_type == "docker" ]]; then
        docker-compose down > /dev/null 2>&1
    else
        sudo pkill -f "gl run" || true
    fi
    sleep 2
}

# Generate comparison report
generate_report() {
    log_section "Generating Comparison Report"

    cat > "$REPORT_FILE" <<'REPORT_HEADER'
# KuponGo Deployment Comparison Report

**Docker vs GardenLiminal Performance Analysis**

REPORT_HEADER

    # Add timestamp
    echo "" >> "$REPORT_FILE"
    echo "**Generated:** $(date)" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # System info
    echo "## System Information" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    jq -r '.system | to_entries | map("- **\(.key | ascii_upcase)**: \(.value)") | .[]' "$RESULTS_FILE" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # Results table
    echo "## Performance Metrics" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "| Metric | Docker | GardenLiminal | Winner |" >> "$REPORT_FILE"
    echo "|--------|--------|---------------|--------|" >> "$REPORT_FILE"

    # Extract metrics and compare
    local docker_startup=$(jq -r '.docker.startup_time_ms' "$RESULTS_FILE")
    local gl_startup=$(jq -r '.gardenliminal.startup_time_ms' "$RESULTS_FILE")
    local startup_winner=$([ $(echo "$gl_startup < $docker_startup" | bc) -eq 1 ] && echo "GardenLiminal ⚡" || echo "Docker")
    echo "| **Startup Time** | ${docker_startup}ms | ${gl_startup}ms | $startup_winner |" >> "$REPORT_FILE"

    local docker_mem=$(jq -r '.docker.memory_kb' "$RESULTS_FILE")
    local gl_mem=$(jq -r '.gardenliminal.memory_kb' "$RESULTS_FILE")
    local mem_winner=$([ $(echo "$gl_mem < $docker_mem" | bc) -eq 1 ] && echo "GardenLiminal 💾" || echo "Docker")
    echo "| **Memory Usage** | ${docker_mem}KB | ${gl_mem}KB | $mem_winner |" >> "$REPORT_FILE"

    local docker_cpu=$(jq -r '.docker.cpu_percent' "$RESULTS_FILE")
    local gl_cpu=$(jq -r '.gardenliminal.cpu_percent' "$RESULTS_FILE")
    local cpu_winner=$([ $(echo "$gl_cpu < $docker_cpu" | bc) -eq 1 ] && echo "GardenLiminal 🔥" || echo "Docker")
    echo "| **CPU Usage** | ${docker_cpu}% | ${gl_cpu}% | $cpu_winner |" >> "$REPORT_FILE"

    local docker_resp=$(jq -r '.docker.response_time_ms' "$RESULTS_FILE")
    local gl_resp=$(jq -r '.gardenliminal.response_time_ms' "$RESULTS_FILE")
    local resp_winner=$([ $(echo "$gl_resp < $docker_resp" | bc) -eq 1 ] && echo "GardenLiminal 🚀" || echo "Docker")
    echo "| **Response Time** | ${docker_resp}ms | ${gl_resp}ms | $resp_winner |" >> "$REPORT_FILE"

    local docker_thr=$(jq -r '.docker.throughput_rps' "$RESULTS_FILE")
    local gl_thr=$(jq -r '.gardenliminal.throughput_rps' "$RESULTS_FILE")
    local thr_winner=$([ $(echo "$gl_thr > $docker_thr" | bc) -eq 1 ] && echo "GardenLiminal 📈" || echo "Docker")
    echo "| **Throughput** | ${docker_thr} req/s | ${gl_thr} req/s | $thr_winner |" >> "$REPORT_FILE"

    echo "" >> "$REPORT_FILE"

    # Add analysis
    echo "## Analysis" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "### Key Findings" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # Calculate percentage differences
    local startup_diff=$(echo "scale=1; ($docker_startup - $gl_startup) / $docker_startup * 100" | bc)
    echo "- **Startup Performance**: GardenLiminal is ${startup_diff}% faster" >> "$REPORT_FILE"

    local mem_diff=$(echo "scale=1; ($docker_mem - $gl_mem) / $docker_mem * 100" | bc)
    echo "- **Memory Efficiency**: GardenLiminal uses ${mem_diff}% less memory" >> "$REPORT_FILE"

    local resp_diff=$(echo "scale=1; ($docker_resp - $gl_resp) / $docker_resp * 100" | bc)
    echo "- **Response Latency**: GardenLiminal is ${resp_diff}% faster" >> "$REPORT_FILE"

    echo "" >> "$REPORT_FILE"
    echo "### Recommendations" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "- **Production**: Use Docker for stability and ecosystem support" >> "$REPORT_FILE"
    echo "- **Development**: Use GardenLiminal for faster iteration and lower resource usage" >> "$REPORT_FILE"
    echo "- **Edge/IoT**: GardenLiminal is better for resource-constrained environments" >> "$REPORT_FILE"
    echo "- **CI/CD**: GardenLiminal provides faster build and test cycles" >> "$REPORT_FILE"

    log_success "Report generated: $REPORT_FILE"
}

# Main execution
main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║  KuponGo Deployment Comparison Benchmark              ║"
    echo "║  Docker vs GardenLiminal                               ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""

    # Check dependencies
    log_info "Checking dependencies..."
    command -v docker >/dev/null 2>&1 || { log_error "Docker not installed"; exit 1; }
    command -v jq >/dev/null 2>&1 || { log_error "jq not installed"; exit 1; }
    command -v bc >/dev/null 2>&1 || { log_error "bc not installed"; exit 1; }

    # Run benchmarks
    run_benchmark "docker"
    sleep 5
    run_benchmark "gardenliminal"

    # Generate report
    generate_report

    # Display summary
    log_section "Benchmark Complete!"
    log_success "Results saved to: $RESULTS_FILE"
    log_success "Report saved to: $REPORT_FILE"

    echo ""
    echo "View report:"
    echo "  cat $REPORT_FILE"
    echo ""
}

main "$@"
