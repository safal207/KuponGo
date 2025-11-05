# KuponGo Test Suite

Comprehensive automated testing for KuponGo project.

## 📋 Overview

This test suite covers:
- **Backend API Tests** - Unit and integration tests for Node.js backend
- **LiminalDB Tests** - Impulse-based database operations
- **Flutter Tests** - Mobile app widget and unit tests
- **WebXR Tests** - Browser AR functionality
- **Integration Tests** - End-to-end testing

## 🚀 Quick Start

### Run All Tests

```bash
./tests/run-all-tests.sh
```

This will execute all test suites and generate a summary report.

### Run Specific Test Suites

#### Backend API Tests
```bash
cd backend
npm test
```

#### LiminalDB Integration Tests
```bash
cd backend
npx mocha tests/liminaldb.test.js --timeout 10000
```

#### Flutter Tests
```bash
cd flutter-app
flutter test
```

## 📊 Test Coverage

### Backend Tests (`backend/tests/`)

**API Tests** (`api.test.js`)
- Health check endpoint
- User registration and authentication
- Coupon CRUD operations
- Nearby coupon queries
- Catch and use coupon mechanics
- Error handling
- Performance benchmarks

**LiminalDB Tests** (`liminaldb.test.js`)
- WebSocket connection
- Impulse push/pull operations
- CBOR encoding
- Geohash-based queries
- Event logging
- User and coupon operations
- Performance tests (100 concurrent operations)

### Flutter Tests (`flutter-app/test/`)

**Service Tests**
- `location_service_test.dart` - Distance calculations, radius checks
- `api_service_test.dart` - HTTP client operations

**Widget Tests**
- `home_screen_test.dart` - UI components, navigation
- `ar_camera_test.dart` - AR interface
- `map_screen_test.dart` - Map integration

## 📈 Test Results

Test results are saved to `test-results/` directory:

```
test-results/
├── Backend-API-Tests_20251105_123456.log
├── LiminalDB-Integration-Tests_20251105_123456.log
├── Flutter-Unit-Tests_20251105_123456.log
└── summary_20251105_123456.txt
```

### Example Summary

```
KuponGo Test Summary
Generated: 2025-11-05 12:34:56

Total Tests: 5
Passed: 5
Failed: 0

Details:
  - Backend-API-Tests: PASSED
  - LiminalDB-Integration-Tests: PASSED
  - Flutter-Unit-Tests: PASSED
  - WebXR-Tests: SKIPPED
  - Integration-Tests: PASSED
```

## 🔧 Test Configuration

### Backend Tests

**Prerequisites:**
- Node.js 18+
- LiminalDB running on `ws://localhost:8787`
- Backend API running on `http://localhost:3000`

**Environment Variables:**
```bash
export API_URL=http://localhost:3000
export LIMINALDB_URL=ws://localhost:8787
```

### Flutter Tests

**Prerequisites:**
- Flutter 3.19+
- Android SDK / Xcode (for device testing)

### Integration Tests

**Prerequisites:**
- Docker and docker-compose
- All services running

## 📝 Writing New Tests

### Backend Test Example

```javascript
const request = require('supertest');
const { expect } = require('chai');

describe('New Feature Tests', () => {
  it('should do something', async () => {
    const res = await request(BASE_URL)
      .get('/api/new-endpoint')
      .expect(200);

    expect(res.body).to.have.property('data');
  });
});
```

### Flutter Test Example

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('New Feature Tests', () {
    test('should calculate correctly', () {
      final result = calculateSomething(10);
      expect(result, equals(20));
    });
  });
}
```

## 🐛 Debugging Failed Tests

### View detailed logs
```bash
cat test-results/Backend-API-Tests_20251105_123456.log
```

### Run specific test
```bash
cd backend
npx mocha tests/api.test.js --grep "should return user profile"
```

### Verbose output
```bash
cd backend
npm test -- --reporter spec
```

## 🎯 CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: ./tests/run-all-tests.sh
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: test-results/
```

## 📚 Related Documentation

- [Backend API Documentation](../backend/README.md)
- [LiminalDB Schema](../docs/LIMINALDB_SCHEMA.md)
- [Flutter App Structure](../flutter-app/README.md)

---

**Automated Testing for KuponGo** 🧪
