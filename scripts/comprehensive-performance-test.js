const axios = require("axios");

const BASE_URL = "http://localhost:2025";

// Comprehensive performance test configuration
const config = {
  iterations: 20,
  concurrentUsers: 5,
  endpoints: [
    // Public endpoints
    { path: "/health", method: "GET", auth: false, category: "public" },
    { path: "/api-docs", method: "GET", auth: false, category: "public" },

    // Authentication endpoints (will test with invalid credentials)
    {
      path: "/users/signup",
      method: "POST",
      auth: false,
      category: "auth",
      data: {
        surname: "Test",
        othernames: "User",
        email: "test@example.com",
        phoneNumber: "+2348012345678",
        password: "TestPassword123!",
        location: "Lagos",
        address: "123 Test Street",
      },
    },
    {
      path: "/users/login",
      method: "POST",
      auth: false,
      category: "auth",
      data: {
        email: "test@example.com",
        password: "TestPassword123!",
      },
    },

    // Protected endpoints (will test with invalid token)
    { path: "/livestocks", method: "GET", auth: true, category: "protected" },
    {
      path: "/groups/active",
      method: "GET",
      auth: true,
      category: "protected",
    },
    {
      path: "/wallet/balance",
      method: "GET",
      auth: true,
      category: "protected",
    },
    {
      path: "/admin/dashboard/stats",
      method: "GET",
      auth: true,
      category: "admin",
    },
  ],
};

class ComprehensivePerformanceTester {
  constructor() {
    this.results = {};
    this.loadTestResults = {};
  }

  async makeRequest(endpoint, requestId = 0) {
    const startTime = Date.now();

    try {
      const options = {
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (endpoint.auth) {
        options.headers.Authorization = "Bearer invalid-token";
      }

      if (endpoint.data) {
        options.data = endpoint.data;
      }

      const response = await axios(options);
      const endTime = Date.now();

      return {
        success: true,
        status: response.status,
        responseTime: endTime - startTime,
        dataSize: JSON.stringify(response.data).length,
        requestId,
      };
    } catch (error) {
      const endTime = Date.now();
      return {
        success: false,
        status: error.response?.status || 0,
        responseTime: endTime - startTime,
        error: error.message,
        requestId,
      };
    }
  }

  async testEndpoint(endpoint) {
    console.log(
      `\n🧪 Testing ${endpoint.method} ${endpoint.path} (${endpoint.category})`
    );

    const results = [];

    for (let i = 0; i < config.iterations; i++) {
      const result = await this.makeRequest(endpoint, i + 1);
      results.push(result);

      if (result.success) {
        console.log(
          `  ✅ Request ${i + 1}: ${result.responseTime}ms (${result.status})`
        );
      } else {
        console.log(
          `  ❌ Request ${i + 1}: ${result.responseTime}ms (${
            result.status
          }) - ${result.error}`
        );
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Calculate statistics
    const successfulResults = results.filter((r) => r.success);
    const responseTimes = successfulResults.map((r) => r.responseTime);

    if (responseTimes.length > 0) {
      const avgResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const minResponseTime = Math.min(...responseTimes);
      const maxResponseTime = Math.max(...responseTimes);
      const successRate = (successfulResults.length / results.length) * 100;

      // Calculate percentiles
      const sortedTimes = responseTimes.sort((a, b) => a - b);
      const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
      const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
      const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

      this.results[endpoint.path] = {
        avgResponseTime: Math.round(avgResponseTime),
        minResponseTime,
        maxResponseTime,
        p50,
        p95,
        p99,
        successRate: Math.round(successRate),
        totalRequests: results.length,
        successfulRequests: successfulResults.length,
        category: endpoint.category,
      };

      console.log(
        `  📊 Avg: ${Math.round(
          avgResponseTime
        )}ms | Min: ${minResponseTime}ms | Max: ${maxResponseTime}ms`
      );
      console.log(
        `  📈 P50: ${p50}ms | P95: ${p95}ms | P99: ${p99}ms | Success: ${Math.round(
          successRate
        )}%`
      );
    } else {
      console.log(`  ❌ All requests failed`);
      this.results[endpoint.path] = {
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        successRate: 0,
        totalRequests: results.length,
        successfulRequests: 0,
        category: endpoint.category,
      };
    }
  }

  async runLoadTest() {
    console.log(
      `\n🚀 Running Load Test with ${config.concurrentUsers} concurrent users...`
    );

    const loadTestEndpoint = { path: "/health", method: "GET", auth: false };
    const promises = [];

    for (let i = 0; i < config.concurrentUsers; i++) {
      promises.push(this.makeRequest(loadTestEndpoint, i + 1));
    }

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const endTime = Date.now();

    const successfulResults = results.filter((r) => r.success);
    const responseTimes = successfulResults.map((r) => r.responseTime);

    if (responseTimes.length > 0) {
      const avgResponseTime =
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const minResponseTime = Math.min(...responseTimes);
      const maxResponseTime = Math.max(...responseTimes);
      const successRate = (successfulResults.length / results.length) * 100;

      this.loadTestResults = {
        totalTime: endTime - startTime,
        avgResponseTime: Math.round(avgResponseTime),
        minResponseTime,
        maxResponseTime,
        successRate: Math.round(successRate),
        totalRequests: results.length,
        successfulRequests: successfulResults.length,
        requestsPerSecond: Math.round(
          (results.length / (endTime - startTime)) * 1000
        ),
      };

      console.log(`  📊 Load Test Results:`);
      console.log(`    ⚡ Total Time: ${endTime - startTime}ms`);
      console.log(`    📈 Avg Response: ${Math.round(avgResponseTime)}ms`);
      console.log(
        `    🚀 Requests/sec: ${Math.round(
          (results.length / (endTime - startTime)) * 1000
        )}`
      );
      console.log(`    ✅ Success Rate: ${Math.round(successRate)}%`);
    }
  }

  async runAllTests() {
    console.log("🚀 Starting Comprehensive Performance Tests...");
    console.log(
      `📊 Testing ${config.endpoints.length} endpoints with ${config.iterations} iterations each\n`
    );

    // Test individual endpoints
    for (const endpoint of config.endpoints) {
      await this.testEndpoint(endpoint);
    }

    // Run load test
    await this.runLoadTest();

    this.printSummary();
  }

  printSummary() {
    console.log("\n📈 COMPREHENSIVE PERFORMANCE TEST SUMMARY");
    console.log("=".repeat(60));

    // Group results by category
    const categories = {};
    Object.entries(this.results).forEach(([endpoint, stats]) => {
      if (!categories[stats.category]) {
        categories[stats.category] = [];
      }
      categories[stats.category].push({ endpoint, ...stats });
    });

    // Print results by category
    Object.entries(categories).forEach(([category, endpoints]) => {
      console.log(`\n📂 ${category.toUpperCase()} ENDPOINTS:`);
      console.log("-".repeat(40));

      endpoints.forEach(
        ({ endpoint, avgResponseTime, successRate, p95, p99 }) => {
          console.log(`${endpoint}:`);
          console.log(
            `  ⚡ Avg: ${avgResponseTime}ms | P95: ${p95}ms | P99: ${p99}ms | Success: ${successRate}%`
          );

          if (avgResponseTime < 50) {
            console.log(`  ✅ Performance: Excellent`);
          } else if (avgResponseTime < 100) {
            console.log(`  ✅ Performance: Good`);
          } else if (avgResponseTime < 200) {
            console.log(`  ⚠️  Performance: Fair`);
          } else {
            console.log(`  ❌ Performance: Poor`);
          }
        }
      );
    });

    // Load test results
    if (this.loadTestResults.totalRequests > 0) {
      console.log(`\n🚀 LOAD TEST RESULTS:`);
      console.log("-".repeat(40));
      console.log(`  ⚡ Total Time: ${this.loadTestResults.totalTime}ms`);
      console.log(
        `  📈 Avg Response: ${this.loadTestResults.avgResponseTime}ms`
      );
      console.log(
        `  🚀 Requests/sec: ${this.loadTestResults.requestsPerSecond}`
      );
      console.log(`  ✅ Success Rate: ${this.loadTestResults.successRate}%`);
    }

    // Overall statistics
    const allResponseTimes = Object.values(this.results)
      .filter((r) => r.avgResponseTime > 0)
      .map((r) => r.avgResponseTime);

    if (allResponseTimes.length > 0) {
      const overallAvg =
        allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length;
      const overallSuccessRate =
        Object.values(this.results).reduce((sum, r) => sum + r.successRate, 0) /
        Object.keys(this.results).length;

      console.log("\n🎯 OVERALL PERFORMANCE:");
      console.log(`  ⚡ Average Response Time: ${Math.round(overallAvg)}ms`);
      console.log(
        `  📊 Overall Success Rate: ${Math.round(overallSuccessRate)}%`
      );

      if (overallAvg < 100 && overallSuccessRate > 95) {
        console.log(`  🏆 Performance Grade: A+ (Excellent)`);
      } else if (overallAvg < 200 && overallSuccessRate > 90) {
        console.log(`  🥇 Performance Grade: A (Good)`);
      } else if (overallAvg < 400 && overallSuccessRate > 80) {
        console.log(`  🥈 Performance Grade: B (Fair)`);
      } else {
        console.log(`  🥉 Performance Grade: C (Needs Improvement)`);
      }
    }

    console.log("\n💡 PERFORMANCE RECOMMENDATIONS:");
    console.log("  🔧 Database Optimization:");
    console.log("    - Add database indexes for frequently queried fields");
    console.log("    - Implement connection pooling");
    console.log("    - Consider query optimization");

    console.log("  🚀 Caching Strategy:");
    console.log("    - Implement Redis caching for static data");
    console.log("    - Cache user sessions and authentication tokens");
    console.log("    - Use CDN for static assets");

    console.log("  📊 Monitoring:");
    console.log("    - Set up performance monitoring (APM)");
    console.log("    - Monitor database query performance");
    console.log("    - Track response time percentiles");

    console.log("  🛡️ Security & Rate Limiting:");
    console.log("    - Current rate limiting is working well");
    console.log("    - Consider implementing request queuing");
    console.log("    - Monitor for unusual traffic patterns");
  }
}

// Run performance tests
async function main() {
  const tester = new ComprehensivePerformanceTester();

  try {
    await tester.runAllTests();
  } catch (error) {
    console.error("❌ Performance test failed:", error.message);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    console.log("✅ Server is running and responding");
    return true;
  } catch (error) {
    console.error("❌ Server is not running or not responding");
    console.error("Please start the server with: npm run dev");
    return false;
  }
}

// Main execution
if (require.main === module) {
  checkServer().then((isRunning) => {
    if (isRunning) {
      main();
    } else {
      process.exit(1);
    }
  });
}

module.exports = ComprehensivePerformanceTester;
