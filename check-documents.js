// Script to check and clean up documents with null s3_key

require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');

async function checkDocuments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lawyer-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Find all documents with null s3_key
    const docsWithNullS3Key = await Document.find({ 
      $or: [
        { s3_key: null },
        { s3_key: { $exists: false } }
      ]
    });

    console.log(`\n📊 Found ${docsWithNullS3Key.length} documents with null s3_key:`);
    
    docsWithNullS3Key.forEach((doc, index) => {
      console.log(`\n${index + 1}. ${doc.file_name}`);
      console.log(`   - ID: ${doc._id}`);
      console.log(`   - User: ${doc.user_id}`);
      console.log(`   - s3_key: ${doc.s3_key}`);
      console.log(`   - is_metadata_only: ${doc.is_metadata_only}`);
      console.log(`   - local_path: ${doc.local_path || 'N/A'}`);
    });

    // Ask if user wants to delete them
    console.log('\n⚠️  These documents have null s3_key which is causing the duplicate key error.');
    console.log('💡 You can either:');
    console.log('   1. Delete all these documents');
    console.log('   2. Keep only metadata-only documents (is_metadata_only: true)');
    console.log('   3. Exit and handle manually');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDocuments();
