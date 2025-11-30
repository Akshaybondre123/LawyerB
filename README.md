# Lawyer App Backend API

Backend API for the Lawyer App with S3 file upload functionality.

## Features

- 📤 Base64 file upload to Amazon S3
- 💾 PostgreSQL database integration
- 🔐 Secure file storage with signed URLs
- 📄 Document management (CRUD operations)
- 🌐 RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- AWS S3 account with access credentials

## Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your configuration:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=lawyer_app
   DB_USER=postgres
   DB_PASSWORD=your_password
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=lawyer-app-documents
   ```

3. **Set up the database:**
   ```bash
   # Create database
   createdb lawyer_app
   
   # Run schema
   psql -d lawyer_app -f database/schema.sql
   ```

4. **Configure AWS S3:**
   - Create an S3 bucket in AWS Console
   - Set up IAM user with S3 permissions
   - Update bucket name in `.env`

## Running the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Upload Document
```
POST /api/documents/upload
Content-Type: application/json

{
  "base64Data": "data:image/png;base64,iVBORw0KG...",
  "fileName": "document.pdf",
  "mimeType": "application/pdf",
  "userId": 1
}
```

### Get User Documents
```
GET /api/documents/user/:userId
```

### Get Single Document
```
GET /api/documents/:docId
```

### Delete Document
```
DELETE /api/documents/:docId
```

### Health Check
```
GET /api/health
```

## Database Schema

### docs table
- `id` - Primary key
- `user_id` - Foreign key to users table
- `doc_path` - S3 file URL
- `file_name` - Original file name
- `file_size` - File size in bytes
- `file_type` - MIME type
- `s3_key` - S3 object key
- `uploaded_at` - Upload timestamp

## AWS S3 Configuration

The application uses AWS SDK to upload files to S3. Files are organized by user:
```
s3://bucket-name/users/{userId}/documents/{uuid}.{extension}
```

Files are stored with `private` ACL and accessed via signed URLs with 1-hour expiration.

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Security Notes

- Files are stored with private ACL
- Signed URLs expire after 1 hour
- Maximum file size: 50MB
- CORS enabled for frontend integration
- Environment variables for sensitive data

## Troubleshooting

**Database connection error:**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

**S3 upload error:**
- Verify AWS credentials
- Check S3 bucket permissions
- Ensure bucket exists in specified region

**Port already in use:**
- Change PORT in `.env`
- Kill process using port 5000
