// Simple test without Sequelize to check if pg is available
module.exports = async (req, res) => {
  try {
    console.log('Simple test function called');
    
    // Check if pg is available
    let pgAvailable = false;
    let pgError = null;
    
    try {
      const pg = require('pg');
      console.log('pg package found:', !!pg);
      pgAvailable = true;
    } catch (error) {
      console.error('pg package not found:', error.message);
      pgError = error.message;
    }
    
    // Check environment variables
    const envVars = {
      DATABASE_HOST: process.env.DATABASE_HOST,
      DATABASE_PORT: process.env.DATABASE_PORT,
      DATABASE_NAME: process.env.DATABASE_NAME,
      DATABASE_USER: process.env.DATABASE_USER,
      DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ? '***hidden***' : 'NOT_SET',
      JWT_SECRET: process.env.JWT_SECRET ? '***hidden***' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV
    };
    
    console.log('Environment variables:', envVars);
    
    res.status(200).json({
      success: true,
      message: 'Simple test working',
      pgAvailable,
      pgError,
      envVars,
      nodeVersion: process.version,
      platform: process.platform
    });
    
  } catch (error) {
    console.error('Simple test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
