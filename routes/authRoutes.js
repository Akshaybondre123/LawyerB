const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Check if PC ID is registered for a user
router.post('/check-pc-id', async (req, res) => {
  try {
    const { email, pcId } = req.body;
    
    if (!email || !pcId) {
      return res.status(400).json({
        success: false,
        message: 'Email and PC ID are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        isRegistered: false,
        message: 'User not found'
      });
    }

    // Check if PC ID is in registered list
    const isRegistered = user.registeredPcIds && user.registeredPcIds.includes(pcId);
    
    res.json({
      success: true,
      isRegistered: isRegistered,
      message: isRegistered 
        ? 'PC ID is registered for this account' 
        : 'PC ID is not registered for this account'
    });
  } catch (error) {
    console.error('Check PC ID error:', error);
    res.status(500).json({
      success: false,
      isRegistered: false,
      message: 'Failed to check PC ID registration'
    });
  }
});

// Login endpoint with PC ID validation
router.post('/login', async (req, res) => {
  try {
    const { email, password, pcId } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // If PC ID is provided, validate it
    if (pcId) {
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if PC ID is registered
      const isRegistered = user.registeredPcIds && user.registeredPcIds.includes(pcId);
      
      if (!isRegistered) {
        return res.status(403).json({
          success: false,
          message: 'This PC is not authorized for your account. Please register this PC ID in your website account settings.'
        });
      }
    }

    // Simple authentication - any email/password combination works (mock)
    // In production, you would verify the password here
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const userData = {
      id: user._id.toString(),
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.account_type || 'lawyer'
    };
    
    res.json({
      success: true,
      data: {
        userData: userData,
        token: 'mock_jwt_token_' + Math.random().toString(36).substr(2, 20)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login'
    });
  }
});

// Simple register endpoint
router.post('/register', (req, res) => {
  const { email, password, first_name, last_name } = req.body;
  
  if (email && password && first_name && last_name) {
    const mockUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: email,
      first_name: first_name,
      last_name: last_name,
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
    res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
});

// Simple password change endpoint
router.post('/change-password', (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  
  if (email && currentPassword && newPassword) {
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
});

module.exports = router;
