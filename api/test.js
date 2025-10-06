// Simple test function to debug the issue
const { testConnection } = require('./test-db');

module.exports = async (req, res) => {
  try {
    console.log('Test function called');
    console.log('Environment variables:');
    console.log('DATABASE_HOST:', process.env.DATABASE_HOST);
    console.log('DATABASE_PORT:', process.env.DATABASE_PORT);
    console.log('DATABASE_NAME:', process.env.DATABASE_NAME);
    console.log('DATABASE_USER:', process.env.DATABASE_USER);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    // Test database connection
    const dbResult = await testConnection();
    
    res.status(200).json({
      success: true,
      message: 'Test function working',
      database: dbResult,
      env: {
        DATABASE_HOST: process.env.DATABASE_HOST,
        DATABASE_PORT: process.env.DATABASE_PORT,
        DATABASE_NAME: process.env.DATABASE_NAME,
        DATABASE_USER: process.env.DATABASE_USER,
        JWT_SECRET_EXISTS: !!process.env.JWT_SECRET
      }
    });
  } catch (error) {
    console.error('Test function error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
