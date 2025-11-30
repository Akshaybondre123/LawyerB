const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// Upload file metadata only (no actual file upload)
router.post('/', documentController.uploadMetadata);

// Sync files with specified location (pc, website, both)
router.post('/sync', documentController.syncFiles);

// Upload document (Base64) - legacy endpoint
router.post('/upload', documentController.uploadDocument);

// Get all documents for a user (supports both /user/:userId and ?userId=123)
router.get('/user/:userId', documentController.getUserDocuments);
router.get('/', documentController.getUserDocuments);

// Request to open a file from the Electron app
router.post('/open', documentController.requestFileOpen);

// Update document (PATCH) - must come before /:docId routes
router.patch('/:docId', documentController.updateDocument);

// Delete document - must come before GET /:docId
router.delete('/:docId', documentController.deleteDocument);

// Get single document by ID - should be last among /:docId routes
router.get('/:docId', documentController.getDocument);

module.exports = router;
