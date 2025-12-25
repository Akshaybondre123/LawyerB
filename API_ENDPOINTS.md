# Backend API Endpoints Documentation

## Base URLs
- **Local Development**: `http://localhost:5000`
- **Vercel Production**: `https://lawyer-b-b5ud.vercel.app`

---

## ✅ WORKING ENDPOINTS (Tested & Verified)

### 1. Health Check
```
GET /api/health
```
**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-07T13:02:05.328Z"
}
```

---

### 2. Root Endpoint (API Info)
```
GET /
```
**Response:**
```json
{
  "success": true,
  "message": "Lawyer App Backend API is running",
  "availableRoutes": [
    "GET /api/health",
    "POST /api/v1/auth/login",
    "GET /api/documents",
    "POST /api/documents"
  ],
  "timestamp": "2025-12-07T13:02:02.000Z"
}
```

---

### 3. Debug Configuration
```
GET /api/debug
```
**Response:**
```json
{
  "success": true,
  "storageMode": "AWS S3",
  "hasAWSAccessKey": true,
  "hasAWSSecretKey": true,
  "hasBucket": true,
  "bucketName": "your-bucket-name",
  "accessKey": "AKIA..."
}
```

---

## 🔐 Authentication Endpoints

### 4. Login (Mock)
```
POST /api/v1/auth/login
```
**Request Body:**
```json
{
  "email": "lawyer@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "userData": {
      "id": "user_abc123",
      "email": "lawyer@example.com",
      "first_name": "Test",
      "last_name": "User",
      "role": "lawyer"
    },
    "token": "mock_jwt_token_xyz..."
  }
}
```

---

## 📄 Document Endpoints

### 5. Get All Documents for User (Query Param)
```
GET /api/documents?userId={userId}
```
**Example:**
```
GET http://localhost:5000/api/documents?userId=test-user-123
```
**Response:**
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

### 6. Get All Documents for User (URL Param)
```
GET /api/documents/user/{userId}
```
**Example:**
```
GET http://localhost:5000/api/documents/user/test-user-123
```
**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "doc123",
      "fileName": "contract.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "folderName": "C:\\Documents",
      "filePath": "C:\\Documents\\contract.pdf",
      "lastModified": "2025-12-07T10:00:00.000Z",
      "uploadedAt": "2025-12-07T10:00:00.000Z",
      "isMetadataOnly": true,
      "syncLocation": "pc"
    }
  ]
}
```

### 7. Get Single Document by ID
```
GET /api/documents/{docId}
```
**Example:**
```
GET http://localhost:5000/api/documents/67542abc123def456
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "67542abc123def456",
    "fileName": "contract.pdf",
    "fileSize": 1024000,
    "fileType": "application/pdf",
    "uploadedAt": "2025-12-07T10:00:00.000Z",
    "downloadUrl": "https://s3.amazonaws.com/..."
  }
}
```

### 8. Upload Document (Base64)
```
POST /api/documents/upload
```
**Request Body:**
```json
{
  "base64Data": "data:application/pdf;base64,JVBERi0xLjQK...",
  "fileName": "contract.pdf",
  "mimeType": "application/pdf",
  "userId": "test-user-123",
  "originalPath": "C:\\Documents\\contract.pdf",
  "folderName": "C:\\Documents",
  "syncLocation": "both"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "67542abc123def456",
    "fileName": "contract.pdf",
    "fileSize": 1024000,
    "fileType": "application/pdf",
    "docPath": "https://s3.amazonaws.com/...",
    "uploadedAt": "2025-12-07T10:00:00.000Z"
  }
}
```

### 9. Upload File Metadata Only
```
POST /api/documents
```
**Request Body:**
```json
{
  "userId": "test-user-123",
  "files": [
    {
      "fileName": "contract.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "localPath": "C:\\Documents\\contract.pdf",
      "lastModified": "2025-12-07T10:00:00.000Z",
      "folderName": "C:\\Documents"
    }
  ]
}
```
**Response:**
```json
{
  "success": true,
  "message": "Successfully saved metadata for 1 file(s)",
  "data": [
    {
      "id": "67542abc123def456",
      "fileName": "contract.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "folderName": "C:\\Documents",
      "lastModified": "2025-12-07T10:00:00.000Z",
      "uploadedAt": "2025-12-07T10:00:00.000Z"
    }
  ]
}
```

### 10. Sync Files with Location
```
POST /api/documents/sync
```
**Request Body:**
```json
{
  "userId": "test-user-123",
  "syncLocation": "both",
  "files": [
    {
      "fileName": "contract.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "localPath": "C:\\Documents\\contract.pdf",
      "lastModified": "2025-12-07T10:00:00.000Z",
      "folderName": "C:\\Documents"
    }
  ]
}
```
**syncLocation options:** `"pc"`, `"website"`, `"both"`

**Response:**
```json
{
  "success": true,
  "message": "Successfully synced 1 file(s) to both",
  "data": [
    {
      "id": "67542abc123def456",
      "fileName": "contract.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "folderName": "C:\\Documents",
      "lastModified": "2025-12-07T10:00:00.000Z",
      "uploadedAt": "2025-12-07T10:00:00.000Z",
      "syncLocation": "both"
    }
  ]
}
```

### 11. Update Document
```
PATCH /api/documents/{docId}
```
**Request Body:**
```json
{
  "syncLocation": "website",
  "file_name": "updated-contract.pdf"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Document updated successfully",
  "data": {
    "id": "67542abc123def456",
    "fileName": "updated-contract.pdf",
    "syncLocation": "website",
    "isMetadataOnly": true
  }
}
```

### 12. Delete Document
```
DELETE /api/documents/{docId}
```
**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### 13. Request File Open (Electron App)
```
POST /api/documents/open
```
**Request Body:**
```json
{
  "docId": "67542abc123def456"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "67542abc123def456",
    "fileName": "contract.pdf",
    "localPath": "C:\\Documents\\contract.pdf",
    "fileType": "application/pdf"
  }
}
```

---

## 🔧 Frontend Usage Examples

### JavaScript/React Fetch Examples

#### Get Documents:
```javascript
const userId = "test-user-123";

// Method 1: Query parameter
const response = await fetch(`http://localhost:5000/api/documents?userId=${userId}`);

// Method 2: URL parameter
const response = await fetch(`http://localhost:5000/api/documents/user/${userId}`);

const result = await response.json();
console.log(result.data); // Array of documents
```

#### Upload Document:
```javascript
const uploadDocument = async (file, userId) => {
  // Convert file to base64
  const base64Data = await convertToBase64(file);
  
  const response = await fetch('http://localhost:5000/api/documents/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      base64Data: base64Data,
      fileName: file.name,
      mimeType: file.type,
      userId: userId,
      syncLocation: 'both'
    })
  });
  
  return await response.json();
};
```

#### Login:
```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const result = await response.json();
  if (result.success) {
    localStorage.setItem('userData', JSON.stringify(result.data.userData));
    localStorage.setItem('token', result.data.token);
  }
  return result;
};
```

---

## ⚠️ Important Notes

1. **Local Development**: Backend runs on `http://localhost:5000`
2. **Production**: Use `https://lawyer-b-b5ud.vercel.app`
3. **CORS**: Enabled for all origins (`*`)
4. **File Size Limit**: 50MB for JSON payloads
5. **Storage**: AWS S3 for file uploads
6. **Database**: MongoDB for metadata storage

---

## 🚀 Starting the Backend

```bash
cd backend
npm start
```

Server will start on: `http://localhost:5000`

---

## 📝 Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing fields)
- `404` - Not Found
- `500` - Internal Server Error
