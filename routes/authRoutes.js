const express = require('express');
const router = express.Router();

// Mock login endpoint for testing
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication - replace with real auth logic
  if (email && password) {
    const mockUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: email,
      first_name: 'Test',
      last_name: 'User',
      role: 'lawyer'
    };
    
    res.json({
      success: true,
      data: {
        userData: mockUser,
        token: 'mock_jwt_token_' + Math.random().toString(36).substr(2, 20)
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

module.exports = router;
