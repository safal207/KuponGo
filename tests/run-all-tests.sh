#!/bin/bash
# Run all tests for KuponGo project
# Includes: Backend tests, Flutter tests, Integration tests, Performance tests

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEST_RESULTS_DIR="${PROJECT_ROOT}/test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_section() { echo -e "\n${CYAN}═══ $1 ═══${NC}\n"; }

# Create test results directory
mkdir -p "$TEST_RESULTS_DIR"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Track test results
declare -A TEST_RESULTS

run_test_suite() {
    local suite_name=$1
    local command=$2

    log_section "$suite_name"
    log_info "Running: $command"

    if eval "$command" > "${TEST_RESULTS_DIR}/${suite_name}_${TIMESTAMP}.log" 2>&1; then
        log_success "$suite_name PASSED"
        TEST_RESULTS[$suite_name]="PASSED"
        ((PASSED_TESTS++))
    else
        log_error "$suite_name FAILED"
        TEST_RESULTS[$suite_name]="FAILED"
        ((FAILED_TESTS++))
        echo "  See logs: ${TEST_RESULTS_DIR}/${suite_name}_${TIMESTAMP}.log"
    fi

    ((TOTAL_TESTS++))
}

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║         KuponGo Automated Test Suite                 ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# 1. Backend API Tests
log_section "Backend API Tests"
cd "${PROJECT_ROOT}/backend"

if [[ ! -d "node_modules" ]]; then
    log_info "Installing backend dependencies..."
    npm install --silent
fi

# Check if test dependencies are installed
if ! grep -q "mocha" package.json; then
    log_info "Installing test dependencies..."
    npm install --save-dev mocha chai supertest --silent
fi

# Update package.json with test script if not present
if ! grep -q "\"test\"" package.json; then
    log_info "Adding test script to package.json..."
    cat > package.json.tmp <<'PACKAGE_JSON'
{
  "name": "kupongo-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/server.js",
    "test": "mocha tests/**/*.test.js --timeout 10000 --exit"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.2",
    "cbor": "^9.0.1",
    "ngeohash": "^0.6.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "mocha": "^10.2.0",
    "chai": "^4.3.10",
    "supertest": "^6.3.3"
  }
}
PACKAGE_JSON
    mv package.json.tmp package.json
    npm install --silent
fi

run_test_suite "Backend-API-Tests" "cd ${PROJECT_ROOT}/backend && npm test"
run_test_suite "LiminalDB-Integration-Tests" "cd ${PROJECT_ROOT}/backend && npx mocha tests/liminaldb.test.js --timeout 10000 --exit"

# 2. Flutter Tests
log_section "Flutter App Tests"
cd "${PROJECT_ROOT}/flutter-app"

if command -v flutter &> /dev/null; then
    run_test_suite "Flutter-Unit-Tests" "cd ${PROJECT_ROOT}/flutter-app && flutter test"
else
    log_error "Flutter not installed, skipping Flutter tests"
    TEST_RESULTS["Flutter-Tests"]="SKIPPED"
fi

# 3. WebXR Tests (if any)
log_section "WebXR Demo Tests"
cd "${PROJECT_ROOT}/webxr-demo"

if [[ -f "package.json" ]]; then
    if [[ ! -d "node_modules" ]]; then
        npm install --silent
    fi

    # Check if there are tests
    if grep -q "\"test\"" package.json 2>/dev/null; then
        run_test_suite "WebXR-Tests" "cd ${PROJECT_ROOT}/webxr-demo && npm test"
    else
        log_info "No WebXR tests configured, skipping"
        TEST_RESULTS["WebXR-Tests"]="SKIPPED"
    fi
else
    log_info "No WebXR test configuration, skipping"
    TEST_RESULTS["WebXR-Tests"]="SKIPPED"
fi

# 4. Integration Tests
log_section "Integration Tests"

# Check if Docker is running
if docker info &> /dev/null; then
    log_info "Starting services for integration tests..."
    cd "${PROJECT_ROOT}"
    docker-compose up -d > /dev/null 2>&1

    # Wait for services to be ready
    sleep 10

    # Run integration tests
    run_test_suite "Integration-Tests" "cd ${PROJECT_ROOT}/backend && API_URL=http://localhost:3000 npm test"

    # Cleanup
    docker-compose down > /dev/null 2>&1
else
    log_error "Docker not running, skipping integration tests"
    TEST_RESULTS["Integration-Tests"]="SKIPPED"
fi

# Generate Summary Report
log_section "Test Summary"

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                   Test Results                        ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

for suite in "${!TEST_RESULTS[@]}"; do
    result="${TEST_RESULTS[$suite]}"
    if [[ $result == "PASSED" ]]; then
        echo -e "  ${GREEN}✓${NC} $suite"
    elif [[ $result == "FAILED" ]]; then
        echo -e "  ${RED}✗${NC} $suite"
    else
        echo -e "  ${YELLOW}⊘${NC} $suite ($result)"
    fi
done

echo ""
echo "Summary:"
echo "  Total: $TOTAL_TESTS"
echo "  Passed: ${GREEN}$PASSED_TESTS${NC}"
echo "  Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

# Save summary to file
cat > "${TEST_RESULTS_DIR}/summary_${TIMESTAMP}.txt" <<SUMMARY
KuponGo Test Summary
Generated: $(date)

Total Tests: $TOTAL_TESTS
Passed: $PASSED_TESTS
Failed: $FAILED_TESTS

Details:
$(for suite in "${!TEST_RESULTS[@]}"; do
    echo "  - $suite: ${TEST_RESULTS[$suite]}"
done)

Test logs available in: $TEST_RESULTS_DIR
SUMMARY

log_success "Summary saved to: ${TEST_RESULTS_DIR}/summary_${TIMESTAMP}.txt"

# Exit with error code if any tests failed
if [[ $FAILED_TESTS -gt 0 ]]; then
    log_error "Some tests failed!"
    exit 1
else
    log_success "All tests passed!"
    exit 0
fi
