const app = require('../server');

module.exports = async (req, res) => {
  try {
    await app(req, res);
  } catch (error) {
    console.error('Unhandled error in serverless function:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error occurred'
    });
  }
};
