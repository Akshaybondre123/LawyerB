# Local File Storage Guide

## 🎯 Overview

The application now supports **local file storage** as an alternative to AWS S3. This is perfect for:
- ✅ Testing without AWS credentials
- ✅ Development environment
- ✅ Local deployment
- ✅ Avoiding AWS costs

## 🔄 How It Works

The backend automatically detects if AWS credentials are configured:

- **If AWS credentials are valid** → Uses AWS S3
- **If AWS credentials are missing/invalid** → Uses local storage

## 📁 Local Storage Location

Files are stored in:
```
backend/uploads/user-{userId}/{unique-filename}.{ext}
```

Example:
```
backend/uploads/user-test-user-123/abc123-def456.pdf
```

## ✅ Setup (No AWS Required!)

### Step 1: Ensure .env is Configured

Your `backend/.env` should have:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lawyer_app

# Leave AWS credentials as placeholders (local storage will be used)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=lawyer-app-documents
```

### Step 2: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
📁 File storage mode: Local Storage
✅ Local storage initialized: C:\...\backend\uploads
✅ MongoDB connected successfully
🚀 Server running on http://localhost:5000
```

### Step 3: Upload Files

Files will be automatically saved to `backend/uploads/` folder.

## 🔍 Verify Local Storage

### Check Upload Directory

```bash
# Windows
dir backend\uploads

# macOS/Linux
ls -la backend/uploads
```

### Test Upload

1. Open frontend: http://localhost:5173
2. Login
3. Upload a file
4. Check `backend/uploads/user-test-user-123/` folder

### Access Files Directly

Files are served at:
```
http://localhost:5000/uploads/user-{userId}/{filename}
```

Example:
```
http://localhost:5000/uploads/user-test-user-123/abc123-def456.pdf
```

## 🔄 Switching to AWS S3

When you're ready to use AWS S3:

### Step 1: Get AWS Credentials

1. Log in to AWS Console
2. Go to IAM → Users
3. Create user with S3 permissions
4. Generate Access Key

### Step 2: Update .env

```env
AWS_ACCESS_KEY_ID=AKIA...  # Your real key
AWS_SECRET_ACCESS_KEY=wJal...  # Your real secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### Step 3: Restart Backend

```bash
npm run dev
```

You should see:
```
📁 File storage mode: AWS S3
```

## 📊 Features

### Local Storage
- ✅ No AWS account needed
- ✅ No costs
- ✅ Fast uploads
- ✅ Easy debugging
- ✅ Files stored locally
- ❌ Not suitable for production
- ❌ No CDN benefits
- ❌ Server storage limits

### AWS S3
- ✅ Production-ready
- ✅ Unlimited storage
- ✅ CDN integration
- ✅ High availability
- ✅ Backup/versioning
- ❌ Requires AWS account
- ❌ Costs money
- ❌ More complex setup

## 🐛 Troubleshooting

### Files not uploading

**Check backend logs:**
```
📁 File storage mode: Local Storage
✅ Local storage initialized: ...
```

**Check uploads directory exists:**
```bash
ls backend/uploads
```

### Cannot access uploaded files

**Check URL format:**
```
http://localhost:5000/uploads/user-test-user-123/filename.pdf
```

**Check file exists:**
```bash
ls backend/uploads/user-test-user-123/
```

### Storage mode not switching

**Clear and restart:**
```bash
# Stop backend (Ctrl+C)
# Update .env
# Restart backend
npm run dev
```

## 📝 API Endpoints

All endpoints work the same with local storage:

### Upload
```http
POST /api/documents/upload
```

### Get Documents
```http
GET /api/documents/user/:userId
```

### Delete Document
```http
DELETE /api/documents/:docId
```

## 🔐 Security Notes

### Local Storage
- Files are publicly accessible at `/uploads/` URL
- No authentication on file access
- Suitable for development only

### Production Recommendations
- Use AWS S3 with signed URLs
- Implement file access authentication
- Use CDN for better performance
- Enable file encryption

## ✨ Benefits of This Approach

1. **Zero Configuration**: Works out of the box
2. **Automatic Detection**: Switches based on credentials
3. **Same API**: Frontend code doesn't change
4. **Easy Testing**: No AWS account needed
5. **Smooth Transition**: Switch to S3 anytime

## 🎉 You're Ready!

With local storage, you can:
- ✅ Upload files immediately
- ✅ Test the full application
- ✅ Develop without AWS
- ✅ Switch to S3 when ready

Just start the backend and upload files - it works! 🚀
