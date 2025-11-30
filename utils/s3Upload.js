const s3 = require('../config/s3');
const { v4: uuidv4 } = require('uuid');

/**
 * Upload Base64 file to S3
 * @param {string} base64Data - Base64 encoded file data
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @param {number} userId - User ID for organizing files
 * @returns {Promise<object>} - S3 upload result with key and location
 */
async function uploadBase64ToS3(base64Data, fileName, mimeType, userId) {
  try {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Content = base64Data.replace(/^data:.*?;base64,/, '');
    
    // Convert base64 to buffer
    const fileBuffer = Buffer.from(base64Content, 'base64');
    
    // Generate unique file name
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const s3Key = `users/${userId}/documents/${uniqueFileName}`;
    
    // S3 upload parameters
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: mimeType,
      ContentEncoding: 'base64',
      ACL: 'private', // Change to 'public-read' if you want public access
    };
    
    // Upload to S3
    const result = await s3.upload(params).promise();
    
    return {
      success: true,
      s3Key: result.Key,
      location: result.Location,
      bucket: result.Bucket,
      etag: result.ETag,
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
}

/**
 * Delete file from S3
 * @param {string} s3Key - S3 object key
 * @returns {Promise<boolean>}
 */
async function deleteFromS3(s3Key) {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
    };
    
    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('S3 Delete Error:', error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
}

/**
 * Get signed URL for private file access
 * @param {string} s3Key - S3 object key
 * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} - Signed URL
 */
async function getSignedUrl(s3Key, expiresIn = 3600) {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Expires: expiresIn,
    };
    
    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    console.error('S3 Signed URL Error:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

module.exports = {
  uploadBase64ToS3,
  deleteFromS3,
  getSignedUrl,
};
