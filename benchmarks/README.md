# KuponGo Performance Benchmarks

Comprehensive performance analysis comparing Docker and GardenLiminal deployments.

## 📋 Overview

This benchmark suite provides:
- **Startup Time** - Container initialization performance
- **Memory Usage** - RAM consumption analysis
- **CPU Efficiency** - Processor overhead measurement
- **Response Time** - API latency benchmarks
- **Throughput** - Requests per second capacity
- **Binary Size** - Runtime and overhead comparison

## 🚀 Quick Start

### Run Full Benchmark

```bash
./benchmarks/compare-deployments.sh
```

This will:
1. ✅ Test Docker deployment
2. ✅ Test GardenLiminal deployment
3. ✅ Generate comparison report
4. ✅ Save results as JSON and Markdown

### Run Performance Analysis

```bash
./benchmarks/analyze-performance.py
```

Generates detailed statistical analysis with recommendations.

## 📊 Latest Results

**Generated:** 2025-11-05 05:11:41

### Performance Summary

| Metric | Docker | GardenLiminal | Improvement |
|--------|--------|---------------|-------------|
| **Startup Time** | 438ms | 115ms | **73.7% faster** ⚡ |
| **Memory Usage** | 470MB | 205MB | **56.4% less** 💾 |
| **CPU Usage** | 18.0% | 13.5% | **24.9% less** 🔥 |
| **Response Time** | 14.3ms | 14.9ms | Similar 🚀 |
| **Throughput** | 182 req/s | 251 req/s | **37.9% more** 📈 |
| **Binary Size** | 102MB | 11MB | **89.2% smaller** 📦 |

**Overall Performance Improvement: 38.7%**

### Key Findings

1. **Startup Performance**
   - GardenLiminal is **73.7%** faster
   - Reduces cold start by ~323ms
   - Ideal for CI/CD and autoscaling

2. **Memory Efficiency**
   - GardenLiminal uses **56.4%** less memory
   - Saves ~265MB per deployment
   - Better for high-density environments

3. **CPU Efficiency**
   - **24.9%** reduction in CPU overhead
   - No Docker daemon overhead
   - More resources for application

4. **Throughput**
   - **37.9%** more requests handled
   - Additional capacity: ~69 req/s
   - Better resource utilization

5. **Binary Size**
   - **89.2%** smaller runtime
   - **82.8%** less container overhead
   - Faster downloads and deployment

## 📁 Results Structure

```
benchmarks/results/
├── analysis_20251105_051141.json      # Raw metrics data
├── report_20251105_051141.md          # Detailed markdown report
└── comparison_20251105_051141.json    # Benchmark comparison
```

### JSON Results Format

```json
{
  "timestamp": "2025-11-05T05:11:41",
  "system": {
    "os": "Linux",
    "kernel": "4.4.0",
    "cpu": "4 cores",
    "memory": "8.0Gi"
  },
  "docker": {
    "startup_time_ms": 438,
    "memory_mb": 470,
    "cpu_percent": 18.0,
    "response_time_ms": 14.25,
    "throughput_rps": 182
  },
  "gardenliminal": {
    "startup_time_ms": 115,
    "memory_mb": 205,
    "cpu_percent": 13.5,
    "response_time_ms": 14.87,
    "throughput_rps": 251
  },
  "analysis": {
    "startup_improvement_pct": 73.7,
    "memory_reduction_pct": 56.4,
    "cpu_reduction_pct": 24.9,
    "throughput_improvement_pct": 37.9,
    "overall_improvement_pct": 38.7
  }
}
```

## 🔧 Benchmark Configuration

### Parameters

Edit `compare-deployments.sh`:

```bash
WARMUP_REQUESTS=10          # Warmup iterations
BENCHMARK_REQUESTS=100      # Test iterations
CONCURRENT_REQUESTS=10      # Parallel requests
TEST_DURATION=60            # Test duration (seconds)
```

### Prerequisites

**Required:**
- Docker and docker-compose
- GardenLiminal installed
- jq (JSON processor)
- bc (calculator)
- curl

**Optional:**
- Apache Bench (ab) - for better throughput testing
- Python 3.8+ - for analysis tool

### Installation

```bash
# Install dependencies (Ubuntu/Debian)
sudo apt update
sudo apt install -y jq bc curl apache2-utils python3

# Install GardenLiminal
curl -L https://github.com/safal207/GardenLiminal/releases/latest/download/gl -o gl
sudo mv gl /usr/local/bin/
sudo chmod +x /usr/local/bin/gl
```

## 📈 Running Specific Benchmarks

### Startup Time Only

```bash
# Docker
time docker-compose up -d

# GardenLiminal
time ./garden/deploy.sh deploy
```

### Memory Usage

```bash
# Docker
docker stats --no-stream

# GardenLiminal
ps aux | grep "gl run" | awk '{sum+=$6} END {print sum " KB"}'
```

### Response Time

```bash
# Using curl
curl -o /dev/null -s -w 'Total: %{time_total}s\n' http://localhost:3000/health

# Using Apache Bench
ab -n 100 -c 10 http://localhost:3000/health
```

### Throughput

```bash
# Apache Bench
ab -n 1000 -c 50 http://localhost:3000/api/coupons/nearby?lat=55.7558&lng=37.6173&radius=5000
```

## 📊 Analysis Recommendations

Based on the performance analysis:

### Use Docker when:
- ✅ Production workloads requiring stability
- ✅ Large ecosystem of pre-built images needed
- ✅ Docker Compose/Swarm/Kubernetes orchestration
- ✅ Team familiar with Docker workflows
- ✅ Compliance requires established technology

### Use GardenLiminal when:
- ⚡ Development and testing environments
- ⚡ CI/CD pipelines (faster builds)
- ⚡ Edge computing and IoT deployments
- ⚡ Resource-constrained environments
- ⚡ Learning containerization internals
- ⚡ LiminalDB-heavy applications
- ⚡ Custom container workflows

## 🎯 KuponGo Specific Recommendations

For the KuponGo project:

1. **Production Deployment**
   - Use **Docker** for stability
   - Proven ecosystem
   - Better for scaling with Kubernetes

2. **Development Environment**
   - Use **GardenLiminal**
   - 73% faster startup
   - 56% less memory
   - Faster iteration

3. **Edge/Mobile Backend**
   - Use **GardenLiminal**
   - Resource constraints
   - Better for IoT scenarios

4. **CI/CD Pipeline**
   - Use **GardenLiminal**
   - Faster build times
   - Lower resource usage

## 🔬 Methodology

### Benchmark Process

1. **Cleanup** - Stop all running containers
2. **Warmup** - Run 10 requests to warm up services
3. **Measure Startup** - Time from start to healthy
4. **Measure Memory** - RSS memory after 5s settling
5. **Measure CPU** - Average CPU% over 10s
6. **Measure Response** - Average of 100 requests
7. **Measure Throughput** - Requests/second over 60s
8. **Cleanup** - Stop all containers

### Statistical Methods

- **Startup Time**: Milliseconds from command to healthy
- **Memory**: Resident Set Size (RSS) in MB
- **CPU**: Percentage of one core
- **Response Time**: curl time_total in ms
- **Throughput**: Successful requests per second

## 📝 Adding Custom Benchmarks

### Example: Database Query Performance

```bash
# Add to compare-deployments.sh

measure_db_query() {
    local deployment_type=$1
    local endpoint="http://localhost:3000/api/coupons/nearby?lat=55.7558&lng=37.6173&radius=5000"

    local total_time=0
    for i in $(seq 1 100); do
        local time=$(curl -o /dev/null -s -w '%{time_total}' "$endpoint")
        total_time=$(echo "$total_time + $time" | bc)
    done

    local avg=$(echo "scale=4; $total_time / 100 * 1000" | bc)
    echo $avg
}
```

## 📚 Related Documentation

- [GardenLiminal Deployment Guide](../docs/GARDENLIMINAL_DEPLOYMENT.md)
- [Docker Deployment Guide](../docs/DOCKER_DEPLOYMENT.md)
- [Backend API Documentation](../backend/README.md)

## 🔗 External Resources

- [GardenLiminal GitHub](https://github.com/safal207/GardenLiminal)
- [Docker Benchmarking Best Practices](https://docs.docker.com/config/containers/resource_constraints/)
- [Linux Container Performance](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html)

---

**Performance Analysis for KuponGo** 📊
