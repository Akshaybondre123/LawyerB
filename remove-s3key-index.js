// Script to completely remove the s3_key unique index

require('dotenv').config();
const mongoose = require('mongoose');

async function removeIndex() {
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

    // Drop the s3_key index completely
    try {
      await collection.dropIndex('s3_key_1');
      console.log('\n✅ Dropped s3_key_1 index completely');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  s3_key_1 index does not exist');
      } else {
        throw error;
      }
    }

    // Verify indexes
    const newIndexes = await collection.indexes();
    console.log('\n📋 Updated indexes:');
    newIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log('\n✅ s3_key index removed! Metadata uploads should work now.');
    console.log('💡 Note: s3_key will no longer have a unique constraint.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeIndex();
