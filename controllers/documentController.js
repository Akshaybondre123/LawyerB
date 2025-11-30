const Document = require('../models/Document');
const { uploadBase64ToS3, deleteFromS3, getSignedUrl } = require('../utils/s3Upload');
const path = require('path');

// Always use S3 for production
console.log('📁 File storage mode: AWS S3');

// Upload file metadata only (no actual file upload)
exports.uploadMetadata = async (req, res) => {
  try {
    const { files, userId } = req.body;

    console.log('📥 Upload Metadata Request:');
    console.log('  - User ID:', userId);
    console.log('  - Files received:', files ? files.length : 0);
    console.log('  - Files data:', JSON.stringify(files, null, 2));

    // Validate input
    if (!files || !Array.isArray(files) || files.length === 0) {
      console.log('❌ Validation failed: No files or empty array');
      return res.status(400).json({
        success: false,
        message: 'Missing required field: files (array of file metadata)',
      });
    }

    if (!userId) {
      console.log('❌ Validation failed: No userId');
      return res.status(400).json({
        success: false,
        message: 'Missing required field: userId',
      });
    }

    // Process and save all file metadata
    const savedDocuments = [];
    const errors = [];

    for (const fileMetadata of files) {
      try {
        const { fileName, fileSize, fileType, localPath, lastModified, folderName } = fileMetadata;

        // Validate required fields
        if (!fileName || !fileSize || !fileType || !localPath) {
          errors.push({
            fileName: fileName || 'unknown',
            error: 'Missing required metadata fields',
          });
          continue;
        }

        // Create document with metadata only
        const document = new Document({
          user_id: userId,
          doc_path: localPath, // Store local path
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          local_path: localPath,
          folder_name: folderName || path.dirname(localPath),
          last_modified: lastModified ? new Date(lastModified) : new Date(),
          is_metadata_only: true,
          sync_location: 'pc', // Default to PC only for metadata-only
          s3_key: null, // No S3 upload
        });

        await document.save();
        savedDocuments.push({
          id: document._id,
          fileName: document.file_name,
          fileSize: document.file_size,
          fileType: document.file_type,
          folderName: document.folder_name,
          lastModified: document.last_modified,
          uploadedAt: document.uploaded_at,
        });
      } catch (error) {
        console.error(`Error saving metadata for ${fileMetadata.fileName}:`, error);
        errors.push({
          fileName: fileMetadata.fileName,
          error: error.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully saved metadata for ${savedDocuments.length} file(s)`,
      data: savedDocuments,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Upload Metadata Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file metadata',
      error: error.message,
    });
  }
};

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    const { base64Data, fileName, mimeType, userId, originalPath, folderName, syncLocation } = req.body;

    // Validate input
    if (!base64Data || !fileName || !mimeType || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: base64Data, fileName, mimeType, userId',
      });
    }

    // Calculate file size from base64
    const base64Content = base64Data.replace(/^data:.*?;base64,/, '');
    const fileSize = Buffer.from(base64Content, 'base64').length;

    // Upload to S3
    const uploadResult = await uploadBase64ToS3(base64Data, fileName, mimeType, userId);

    // Save to database with original local path preserved
    const document = new Document({
      user_id: userId,
      doc_path: uploadResult.location,
      file_name: fileName,
      file_size: fileSize,
      file_type: mimeType,
      s3_key: uploadResult.s3Key,
      local_path: originalPath || null, // Preserve original local path
      folder_name: folderName || (originalPath ? path.dirname(originalPath) : null),
      is_metadata_only: false, // This is a fully uploaded document
      sync_location: syncLocation || 'both', // Default to both if not specified
    });
    
    await document.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        id: document._id,
        fileName: document.file_name,
        fileSize: document.file_size,
        fileType: document.file_type,
        docPath: document.doc_path,
        uploadedAt: document.uploaded_at,
      },
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message,
    });
  }
};

// Get all documents for a user (supports query params)
exports.getUserDocuments = async (req, res) => {
  try {
    // Support both URL params and query params
    const userId = req.params.userId || req.query.userId;
    const metadataOnly = req.query.metadataOnly === 'true'; // Optional filter

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required (provide as URL param or query param)',
      });
    }

    // Build query
    const query = { user_id: userId };
    if (metadataOnly) {
      query.is_metadata_only = true; // Filter only metadata-only documents
    }

    const documents = await Document.find(query).sort({ uploaded_at: -1 });

    // Process documents based on type (metadata-only or uploaded)
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        try {
          // For metadata-only documents
          if (doc.is_metadata_only) {
            return {
              id: doc._id,
              fileName: doc.file_name,
              fileSize: doc.file_size,
              fileType: doc.file_type,
              folderName: doc.folder_name || path.dirname(doc.local_path),
              filePath: doc.local_path, // Real local path on lawyer's computer
              lastModified: doc.last_modified || doc.uploaded_at,
              uploadedAt: doc.uploaded_at,
              isMetadataOnly: true,
              syncLocation: doc.sync_location || 'pc',
            };
          }
          
          // For uploaded documents (legacy)
          let downloadUrl = null;
          if (doc.s3_key) {
            if (USE_S3) {
              downloadUrl = await getSignedUrl(doc.s3_key);
            } else {
              downloadUrl = getLocalFileUrl(doc.s3_key);
            }
          }

          return {
            id: doc._id,
            fileName: doc.file_name,
            fileSize: doc.file_size,
            fileType: doc.file_type,
            folderName: doc.local_path ? path.dirname(doc.local_path) : null,
            filePath: doc.local_path, // Show original local path if available
            lastModified: doc.last_modified || doc.uploaded_at,
            uploadedAt: doc.uploaded_at,
            isMetadataOnly: false,
            syncLocation: doc.sync_location || 'website',
            downloadUrl: downloadUrl,
          };
        } catch (error) {
          console.error(`Error processing doc ${doc._id}:`, error);
          return {
            id: doc._id,
            fileName: doc.file_name,
            fileSize: doc.file_size,
            fileType: doc.file_type,
            folderName: doc.local_path ? path.dirname(doc.local_path) : null,
            lastModified: doc.last_modified || doc.uploaded_at,
            uploadedAt: doc.uploaded_at,
            isMetadataOnly: doc.is_metadata_only || false,
            syncLocation: doc.sync_location || (doc.is_metadata_only ? 'pc' : 'website'),
            filePath: doc.local_path,
            downloadUrl: doc.is_metadata_only ? undefined : doc.doc_path,
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documentsWithUrls,
    });
  } catch (error) {
    console.error('Get Documents Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message,
    });
  }
};

// Update document
exports.updateDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const updateData = req.body;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required',
      });
    }

    console.log('Updating document:', docId, 'with data:', updateData);

    // Update the document
    const document = await Document.findByIdAndUpdate(
      docId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: {
        id: document._id,
        fileName: document.file_name,
        syncLocation: document.sync_location,
        isMetadataOnly: document.is_metadata_only,
      },
    });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document',
      error: error.message,
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required',
      });
    }

    // Get document info
    const document = await Document.findById(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    console.log('Deleting document:', {
      id: docId,
      fileName: document.file_name,
      s3_key: document.s3_key,
      isMetadataOnly: document.is_metadata_only
    });

    // Delete from S3 only if file was uploaded (has s3_key)
    if (document.s3_key && document.s3_key !== null && document.s3_key !== '') {
      console.log('Deleting file from S3:', document.s3_key);
      try {
        await deleteFromS3(document.s3_key);
      } catch (storageError) {
        console.error('S3 delete error (continuing anyway):', storageError);
        // Don't fail the whole delete if S3 delete fails
      }
    } else {
      console.log('Skipping storage delete - no s3_key (metadata-only file)');
    }

    // Delete from database
    await Document.findByIdAndDelete(docId);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message,
    });
  }
};

// Get document by ID with signed URL
exports.getDocument = async (req, res) => {
  try {
    const { docId } = req.params;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required',
      });
    }

    const document = await Document.findById(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Generate signed URL
    const signedUrl = await getSignedUrl(document.s3_key);

    res.status(200).json({
      success: true,
      data: {
        id: document._id,
        fileName: document.file_name,
        fileSize: document.file_size,
        fileType: document.file_type,
        uploadedAt: document.uploaded_at,
        downloadUrl: signedUrl,
      },
    });
  } catch (error) {
    console.error('Get Document Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message,
    });
  }
};

// Sync files with specified location
exports.syncFiles = async (req, res) => {
  try {
    const { files, userId, syncLocation } = req.body;

    console.log('📥 Sync Files Request:');
    console.log('  - User ID:', userId);
    console.log('  - Sync Location:', syncLocation);
    console.log('  - Files received:', files ? files.length : 0);

    // Validate input
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: files (array of file metadata)',
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: userId',
      });
    }

    if (!syncLocation || !['pc', 'website', 'both'].includes(syncLocation)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sync location. Must be: pc, website, or both',
      });
    }

    // Process and save all file metadata
    const savedDocuments = [];
    const errors = [];

    for (const fileMetadata of files) {
      try {
        const { fileName, fileSize, fileType, localPath, lastModified, folderName } = fileMetadata;

        // Validate required fields
        if (!fileName || !fileSize || !fileType || !localPath) {
          errors.push({
            fileName: fileName || 'unknown',
            error: 'Missing required metadata fields',
          });
          continue;
        }

        // Create document with metadata and sync location
        const document = new Document({
          user_id: userId,
          doc_path: localPath,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          local_path: localPath,
          folder_name: folderName || path.dirname(localPath),
          last_modified: lastModified ? new Date(lastModified) : new Date(),
          is_metadata_only: syncLocation === 'pc', // Only metadata if PC only
          sync_location: syncLocation,
          s3_key: null, // No S3 upload for metadata
        });

        await document.save();
        savedDocuments.push({
          id: document._id,
          fileName: document.file_name,
          fileSize: document.file_size,
          fileType: document.file_type,
          folderName: document.folder_name,
          lastModified: document.last_modified,
          uploadedAt: document.uploaded_at,
          syncLocation: document.sync_location,
        });
      } catch (error) {
        console.error(`Error syncing ${fileMetadata.fileName}:`, error);
        errors.push({
          fileName: fileMetadata.fileName,
          error: error.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully synced ${savedDocuments.length} file(s) to ${syncLocation}`,
      data: savedDocuments,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Sync Files Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync files',
      error: error.message,
    });
  }
};

// Request to open a file from the Electron app
exports.requestFileOpen = async (req, res) => {
  try {
    const { docId } = req.body;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required',
      });
    }

    const document = await Document.findById(docId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    if (!document.is_metadata_only) {
      return res.status(400).json({
        success: false,
        message: 'This document is not a metadata-only document',
      });
    }

    // Return the local path so the Electron app can open it
    res.status(200).json({
      success: true,
      data: {
        id: document._id,
        fileName: document.file_name,
        localPath: document.local_path,
        fileType: document.file_type,
      },
    });
  } catch (error) {
    console.error('Request File Open Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process file open request',
      error: error.message,
    });
  }
};
