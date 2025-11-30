const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true,
  },
  doc_path: {
    type: String,
    required: true,
  },
  file_name: {
    type: String,
    required: true,
  },
  file_size: {
    type: Number,
    required: true,
  },
  file_type: {
    type: String,
    required: true,
  },
  s3_key: {
    type: String,
    required: false, // Made optional for metadata-only mode
  },
  // New fields for metadata-only mode
  local_path: {
    type: String,
    required: false, // Local file path on lawyer's computer
  },
  folder_name: {
    type: String,
    required: false, // Parent folder name
  },
  last_modified: {
    type: Date,
    required: false, // Original file's last modified date
  },
  is_metadata_only: {
    type: Boolean,
    default: false, // Flag to distinguish metadata-only documents
  },
  sync_location: {
    type: String,
    enum: ['pc', 'website', 'both'],
    default: 'pc', // Where the file is available: 'pc' (local only), 'website' (uploaded), 'both' (synced to both)
  },
  uploaded_at: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Create indexes for better query performance
documentSchema.index({ user_id: 1, uploaded_at: -1 });
documentSchema.index({ user_id: 1, is_metadata_only: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
