const mongoose = require('mongoose');
const Document = require('../models/Document');
const { connectDB } = require('../config/database');

async function checkUpdated() {
  await connectDB();
  
  const users = await Document.distinct('user_id');
  console.log('Users in database:', users);
  
  // Check updated documents
  const updatedDocs = await Document.find({local_path: { $exists: true }, is_metadata_only: false});
  console.log('\nUpdated uploaded documents:');
  updatedDocs.forEach(doc => {
    console.log(`User: ${doc.user_id}, File: ${doc.file_name}, Path: ${doc.local_path}`);
  });
  
  await mongoose.connection.close();
}

checkUpdated();
