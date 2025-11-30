const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lawyer_app';

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    // Create sample user for testing
    const existingUser = await User.findOne({ email: 'lawyer@example.com' });
    
    if (!existingUser) {
      const sampleUser = new User({
        email: 'lawyer@example.com',
        first_name: 'John',
        last_name: 'Doe',
        account_type: 'lawyer',
      });
      
      await sampleUser.save();
      console.log('✅ Sample user created:', sampleUser.email);
      console.log('   User ID:', sampleUser._id);
    } else {
      console.log('ℹ️  Sample user already exists');
      console.log('   User ID:', existingUser._id);
    }

    // Create indexes
    console.log('✅ Creating indexes...');
    await User.createIndexes();
    const Document = require('../models/Document');
    await Document.createIndexes();
    console.log('✅ Indexes created successfully');

    console.log('\n🎉 Database initialization complete!');
    console.log('\nYou can now use the following credentials for testing:');
    console.log('Email: lawyer@example.com');
    console.log('Password: yourpassword (configure in your auth system)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
