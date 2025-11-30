const mongoose = require('mongoose');
const Document = require('../models/Document');
const { connectDB } = require('../config/database');

// This script tries to match uploaded documents with metadata-only documents
// by filename and update the uploaded documents with the original local path

async function updateUploadedDocuments() {
  try {
    await connectDB();
    
    console.log('🔍 Finding uploaded documents without local paths...');
    
    // Find uploaded documents that don't have local_path
    const uploadedDocs = await Document.find({
      is_metadata_only: false,
      local_path: { $exists: false }
    });

    console.log(`Found ${uploadedDocs.length} uploaded documents to update...`);

    // Find all metadata-only documents to get their paths
    const metadataDocs = await Document.find({
      is_metadata_only: true
    });

    console.log(`Found ${metadataDocs.length} metadata-only documents for reference...`);

    let updated = 0;
    
    for (const uploadedDoc of uploadedDocs) {
      // Try to find a matching metadata-only document by filename
      const matchingMetadata = metadataDocs.find(metaDoc => 
        metaDoc.file_name === uploadedDoc.file_name
      );

      if (matchingMetadata && matchingMetadata.local_path) {
        // Update the uploaded document with the original path
        await Document.updateOne(
          { _id: uploadedDoc._id },
          { 
            $set: { 
              local_path: matchingMetadata.local_path,
              folder_name: matchingMetadata.folder_name
            }
          }
        );
        
        console.log(`✅ Updated: ${uploadedDoc.file_name}`);
        console.log(`   From: ${uploadedDoc.doc_path}`);
        console.log(`   To: ${matchingMetadata.local_path}`);
        updated++;
      } else {
        console.log(`⚠️  No match found for: ${uploadedDoc.file_name}`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updated} documents with original local paths!`);
    
  } catch (error) {
    console.error('❌ Error updating documents:', error);
  } finally {
    await mongoose.connection.close();
  }
}

updateUploadedDocuments();
