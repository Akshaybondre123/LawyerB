// Script to delete documents with null s3_key and recreate the sparse index

require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');

async function fixDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lawyer-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('documents');

    // Step 1: Drop ALL indexes
    console.log('\n🗑️  Dropping all indexes...');
    await collection.dropIndexes();
    console.log('✅ All indexes dropped');

    // Step 2: Delete all documents with null s3_key
    const deleteResult = await Document.deleteMany({ 
      $or: [
        { s3_key: null },
        { s3_key: { $exists: false } }
      ]
    });
    console.log(`\n🗑️  Deleted ${deleteResult.deletedCount} documents with null s3_key`);

    // Step 3: Recreate indexes using Mongoose schema
    console.log('\n🔧 Recreating indexes from schema...');
    await Document.syncIndexes();
    console.log('✅ Indexes synced from schema');

    // Step 4: Verify indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      const sparseInfo = index.sparse ? ' (SPARSE ✅)' : '';
      const uniqueInfo = index.unique ? ' (UNIQUE)' : '';
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}${uniqueInfo}${sparseInfo}`);
    });

    console.log('\n✅ Database fixed! You can now upload metadata-only files.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDatabase();
