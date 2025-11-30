const mongoose = require('mongoose');
const Document = require('../models/Document');
const { connectDB } = require('../config/database');

// This script updates existing uploaded documents to extract original path from doc_path
// when doc_path contains a local path (not a server path)

async function updateExistingDocuments() {
  try {
    await connectDB();
    
    // Find uploaded documents that don't have local_path but have a doc_path that looks like a local path
    const documents = await Document.find({
      is_metadata_only: false,
      local_path: { $exists: false }
    });

    console.log(`Found ${documents.length} documents to check...`);

    let updated = 0;
    
    for (const doc of documents) {
      // Check if doc_path looks like a local Windows path (contains C:\ or similar)
      if (doc.doc_path && (doc.doc_path.includes(':\\') || doc.doc_path.startsWith('C:'))) {
        // This looks like a local path, extract folder name
        const path = require('path');
        const folderName = path.dirname(doc.doc_path);
        
        await Document.updateOne(
          { _id: doc._id },
          { 
            $set: { 
              local_path: doc.doc_path,
              folder_name: folderName
            }
          }
        );
        
        console.log(`Updated: ${doc.file_name} -> ${folderName}`);
        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} documents with original local paths`);
    
  } catch (error) {
    console.error('Error updating documents:', error);
  } finally {
    await mongoose.connection.close();
  }
}

updateExistingDocuments();
