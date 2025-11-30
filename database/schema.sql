-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    account_type VARCHAR(50) DEFAULT 'lawyer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create docs table
CREATE TABLE IF NOT EXISTS docs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    doc_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(100),
    s3_key VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_docs_user_id ON docs(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_uploaded_at ON docs(uploaded_at);

-- Insert sample user for testing (optional)
INSERT INTO users (email, first_name, last_name, account_type) 
VALUES ('lawyer@example.com', 'John', 'Doe', 'lawyer')
ON CONFLICT (email) DO NOTHING;
