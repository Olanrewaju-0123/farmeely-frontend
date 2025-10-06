// Vercel serverless function
const app = require("../index");

// Test database connection on startup
const { testConnection } = require("./test-db");

testConnection().then((result) => {
  console.log("Database test result:", result);
});

// Export as default for Vercel
module.exports = app;
module.exports.default = app;
