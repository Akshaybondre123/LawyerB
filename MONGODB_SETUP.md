# MongoDB Setup Guide

This application uses MongoDB as the database. Follow these steps to set up MongoDB.

## 📦 Install MongoDB

### Windows
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service (recommended)
5. MongoDB Compass (GUI) will be installed automatically

### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## 🚀 Verify MongoDB Installation

```bash
# Check if MongoDB is running
mongosh --version

# Connect to MongoDB
mongosh
```

You should see the MongoDB shell prompt: `test>`

## 🔧 Configure Application

### 1. Set MongoDB URI in .env

```env
MONGODB_URI=mongodb://localhost:27017/lawyer_app
```

### 2. Initialize Database

```bash
cd backend
npm install
node database/init-mongodb.js
```

This will:
- Create the `lawyer_app` database
- Create a sample user
- Set up indexes for better performance

## 📊 Database Structure

### Collections

#### users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  first_name: String,
  last_name: String,
  account_type: String (enum: 'lawyer', 'client', 'admin'),
  created_at: Date,
  updated_at: Date
}
```

#### documents
```javascript
{
  _id: ObjectId,
  user_id: String,
  doc_path: String,
  file_name: String,
  file_size: Number,
  file_type: String,
  s3_key: String (unique),
  uploaded_at: Date
}
```

### Indexes
- `users`: email (unique)
- `documents`: user_id, uploaded_at
- `documents`: compound index on (user_id, uploaded_at)

## 🔍 MongoDB Commands

### Connect to Database
```bash
mongosh mongodb://localhost:27017/lawyer_app
```

### View Collections
```javascript
show collections
```

### View Users
```javascript
db.users.find().pretty()
```

### View Documents
```javascript
db.documents.find().pretty()
```

### Count Documents
```javascript
db.documents.countDocuments()
```

### Find Documents by User
```javascript
db.documents.find({ user_id: "USER_ID_HERE" }).pretty()
```

### Delete All Documents
```javascript
db.documents.deleteMany({})
```

### Drop Database (careful!)
```javascript
use lawyer_app
db.dropDatabase()
```

## 🛠️ MongoDB Compass (GUI)

MongoDB Compass provides a graphical interface for MongoDB.

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select `lawyer_app` database
4. Browse collections: `users`, `documents`

## 🔐 Security (Production)

For production, enable authentication:

### 1. Create Admin User
```javascript
use admin
db.createUser({
  user: "admin",
  pwd: "your_secure_password",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
```

### 2. Create App User
```javascript
use lawyer_app
db.createUser({
  user: "lawyer_app_user",
  pwd: "your_app_password",
  roles: [ { role: "readWrite", db: "lawyer_app" } ]
})
```

### 3. Update Connection String
```env
MONGODB_URI=mongodb://lawyer_app_user:your_app_password@localhost:27017/lawyer_app
```

### 4. Enable Authentication
Edit `/etc/mongod.conf` (Linux) or MongoDB config:
```yaml
security:
  authorization: enabled
```

Restart MongoDB:
```bash
sudo systemctl restart mongod
```

## 🐛 Troubleshooting

### MongoDB won't start
```bash
# Check status
sudo systemctl status mongod

# View logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart
sudo systemctl restart mongod
```

### Connection refused
- Verify MongoDB is running: `mongosh`
- Check port 27017 is not blocked
- Verify MONGODB_URI in .env

### Database not found
- MongoDB creates databases automatically on first write
- Run init script: `node database/init-mongodb.js`

### Permission denied
- Check MongoDB data directory permissions
- Default: `/var/lib/mongodb` (Linux) or `/usr/local/var/mongodb` (Mac)

## 📈 Performance Tips

1. **Indexes**: Already created by init script
2. **Connection Pooling**: Mongoose handles this automatically
3. **Query Optimization**: Use `.lean()` for read-only queries
4. **Projection**: Select only needed fields

Example:
```javascript
// Only get file names and sizes
Document.find({ user_id: userId })
  .select('file_name file_size')
  .lean()
```

## 🔄 Migration from PostgreSQL

If migrating from PostgreSQL:

1. Export PostgreSQL data
2. Transform to MongoDB format
3. Import using `mongoimport` or scripts
4. Verify data integrity
5. Update application code (already done!)

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/) - Free courses

## ✅ Quick Test

After setup, test the connection:

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
📊 Mongoose connected to MongoDB
🚀 Server running on http://localhost:5000
```

Test API:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
