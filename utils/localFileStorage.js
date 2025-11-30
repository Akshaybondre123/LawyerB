const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Local storage directory
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

/**
 * Initialize upload directory
 */
async function initializeStorage() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log('✅ Local storage initialized:', UPLOAD_DIR);
  } catch (error) {
    console.error('❌ Failed to initialize storage:', error);
  }
}

/**
 * Upload Base64 file to local storage
 * @param {string} base64Data - Base64 encoded file data
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @param {number} userId - User ID for organizing files
 * @returns {Promise<object>} - Upload result with key and location
 */
async function uploadBase64ToLocal(base64Data, fileName, mimeType, userId) {
  try {
    // Remove data URL prefix if present
    const base64Content = base64Data.replace(/^data:.*?;base64,/, '');
    
    // Convert base64 to buffer
    const fileBuffer = Buffer.from(base64Content, 'base64');
    
    // Generate unique file name
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    
    // Create user directory
    const userDir = path.join(UPLOAD_DIR, `user-${userId}`);
    await fs.mkdir(userDir, { recursive: true });
    
    // File path
    const filePath = path.join(userDir, uniqueFileName);
    const relativePath = path.join(`user-${userId}`, uniqueFileName);
    
    // Write file
    await fs.writeFile(filePath, fileBuffer);
    
    return {
      success: true,
      s3Key: relativePath, // Using relative path as key
      location: `https://lawyer-b-b5ud.vercel.app/uploads/${relativePath.replace(/\\/g, '/')}`,
      bucket: 'local-storage',
      etag: uniqueFileName,
    };
  } catch (error) {
    console.error('Local Upload Error:', error);
    throw new Error(`Failed to upload file locally: ${error.message}`);
  }
}

/**
 * Delete file from local storage
 * @param {string} fileKey - File key (relative path)
 * @returns {Promise<boolean>}
 */
async function deleteFromLocal(fileKey) {
  try {
    const filePath = path.join(UPLOAD_DIR, fileKey);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Local Delete Error:', error);
    throw new Error(`Failed to delete file locally: ${error.message}`);
  }
}

/**
 * Get file URL for local storage
 * @param {string} fileKey - File key (relative path)
 * @returns {string} - File URL
 */
function getLocalFileUrl(fileKey) {
  return `https://lawyer-b-b5ud.vercel.app/uploads/${fileKey.replace(/\\/g, '/')}`;
}

// Initialize storage on module load
initializeStorage();

module.exports = {
  uploadBase64ToLocal,
  deleteFromLocal,
  getLocalFileUrl,
  UPLOAD_DIR,
};
