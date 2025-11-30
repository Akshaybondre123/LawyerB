// Script to clear old uploaded documents (non-metadata-only)
// Run this to remove old uploaded files and start fresh with metadata mode

require('dotenv').config();
const mongoose = require('mongoose');
const Document = require('./models/Document');

async function clearOldDocuments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lawyer-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Find all non-metadata-only documents
    const oldDocs = await Document.find({ 
      $or: [
        { is_metadata_only: false },
        { is_metadata_only: { $exists: false } }
      ]
    });

    console.log(`\n📊 Found ${oldDocs.length} old uploaded documents`);

    if (oldDocs.length === 0) {
      console.log('✅ No old documents to clear!');
      process.exit(0);
    }

    // Display documents to be deleted
    console.log('\n📋 Documents to be deleted:');
    oldDocs.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.file_name} (${doc.file_size} bytes)`);
    });

    // Delete old documents
    const result = await Document.deleteMany({ 
      $or: [
        { is_metadata_only: false },
        { is_metadata_only: { $exists: false } }
      ]
    });

    console.log(`\n✅ Deleted ${result.deletedCount} old documents`);
    console.log('✅ Database is now clean for metadata-only mode!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearOldDocuments();
