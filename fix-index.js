// Script to fix the s3_key index issue
// This drops the old unique index and recreates it as a sparse index

require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lawyer-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('documents');

    // Get existing indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop the old s3_key index if it exists
    try {
      await collection.dropIndex('s3_key_1');
      console.log('\n✅ Dropped old s3_key_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  s3_key_1 index does not exist (already dropped)');
      } else {
        throw error;
      }
    }

    // Create new sparse unique index on s3_key
    await collection.createIndex(
      { s3_key: 1 }, 
      { 
        unique: true, 
        sparse: true,  // This allows multiple null values
        name: 's3_key_1'
      }
    );
    console.log('✅ Created new sparse unique index on s3_key');

    // Verify new indexes
    const newIndexes = await collection.indexes();
    console.log('\n📋 Updated indexes:');
    newIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), index.sparse ? '(sparse)' : '');
    });

    console.log('\n✅ Index fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndex();
