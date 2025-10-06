const axios = require("axios");

const BASE_URL = "http://localhost:2025";
const TEST_TOKEN = "your_test_token_here"; // Replace with actual token

// Performance test configuration
const config = {
  iterations: 10,
  endpoints: [
    { path: "/health", method: "GET", auth: false },
    { path: "/groups/active", method: "GET", auth: true },
    { path: "/livestocks", method: "GET", auth: true },
    { path: "/users/profile", method: "GET", auth: true },
    { path: "/wallet/balance", method: "GET", auth: true },
  ],
};

class PerformanceTester {
  constructor() {
    this.results = {};
  }

  async makeRequest(endpoint) {
    const startTime = Date.now();

    try {
      const options = {
        method: endpoint.method,
        url: `${BASE_URL}${endpoint.path}`,
        timeout: 10000,
      };

      if (endpoint.auth) {
        options.headers = {
          Authorization: `Bearer ${TEST_TOKEN}`,
        };
      }

      const response = await axios(options);
      const endTime = Date.now();

      return {
        success: true,
        status: response.status,
        responseTime: endTime - startTime,
        dataSize: JSON.stringify(response.data).length,
      };
    } catch (error) {
      const endTime = Date.now();
      return {
        success: false,
        status: error.response?.status || 0,
        responseTime: endTime - startTime,
        error: error.message,
      };
    }
  }

  async testEndpoint(endpoint) {
    console.log(`\n🧪 Testing ${endpoint.method} ${endpoint.path}`);

    const results = [];

    for (let i = 0; i < config.iterations; i++) {
      const result = await this.makeRequest(endpoint);
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
      await new Promise((resolve) => setTimeout(resolve, 100));
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

      this.results[endpoint.path] = {
        avgResponseTime: Math.round(avgResponseTime),
        minResponseTime,
        maxResponseTime,
        successRate: Math.round(successRate),
        totalRequests: results.length,
        successfulRequests: successfulResults.length,
      };

      console.log(
        `  📊 Average: ${Math.round(
          avgResponseTime
        )}ms | Min: ${minResponseTime}ms | Max: ${maxResponseTime}ms | Success: ${Math.round(
          successRate
        )}%`
      );
    } else {
      console.log(`  ❌ All requests failed`);
      this.results[endpoint.path] = {
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        successRate: 0,
        totalRequests: results.length,
        successfulRequests: 0,
      };
    }
  }

  async runAllTests() {
    console.log("🚀 Starting Performance Tests...");
    console.log(
      `📊 Testing ${config.endpoints.length} endpoints with ${config.iterations} iterations each\n`
    );

    for (const endpoint of config.endpoints) {
      await this.testEndpoint(endpoint);
    }

    this.printSummary();
  }

  printSummary() {
    console.log("\n📈 PERFORMANCE TEST SUMMARY");
    console.log("=".repeat(50));

    const sortedResults = Object.entries(this.results).sort(
      ([, a], [, b]) => a.avgResponseTime - b.avgResponseTime
    );

    sortedResults.forEach(([endpoint, stats]) => {
      console.log(`\n${endpoint}:`);
      console.log(`  ⚡ Avg Response Time: ${stats.avgResponseTime}ms`);
      console.log(`  📊 Success Rate: ${stats.successRate}%`);
      console.log(
        `  🔢 Requests: ${stats.successfulRequests}/${stats.totalRequests}`
      );

      if (stats.avgResponseTime < 100) {
        console.log(`  ✅ Performance: Excellent`);
      } else if (stats.avgResponseTime < 300) {
        console.log(`  ✅ Performance: Good`);
      } else if (stats.avgResponseTime < 500) {
        console.log(`  ⚠️  Performance: Fair`);
      } else {
        console.log(`  ❌ Performance: Poor`);
      }
    });

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

      if (overallAvg < 200 && overallSuccessRate > 95) {
        console.log(`  🏆 Performance Grade: A+ (Excellent)`);
      } else if (overallAvg < 400 && overallSuccessRate > 90) {
        console.log(`  🥇 Performance Grade: A (Good)`);
      } else if (overallAvg < 600 && overallSuccessRate > 80) {
        console.log(`  🥈 Performance Grade: B (Fair)`);
      } else {
        console.log(`  🥉 Performance Grade: C (Needs Improvement)`);
      }
    }
  }
}

// Run performance tests
async function main() {
  const tester = new PerformanceTester();

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

module.exports = PerformanceTester;
