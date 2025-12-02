const AWS = require('aws-sdk');
require('dotenv').config();

// Test S3 connection
async function testS3Connection() {
  try {
    console.log('🔧 Testing S3 Configuration...');
    console.log('Bucket:', process.env.AWS_S3_BUCKET);
    console.log('Region:', process.env.AWS_REGION);
    console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set ✓' : 'Missing ✗');
    console.log('Secret Access Key:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set ✓' : 'Missing ✗');

    // Configure AWS
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    const s3 = new AWS.S3();

    // Test bucket access
    console.log('\n📡 Testing bucket access...');
    try {
      const result = await s3.headBucket({ Bucket: process.env.AWS_S3_BUCKET }).promise();
      console.log('✅ S3 bucket access successful!');
    } catch (bucketError) {
      console.error('❌ Bucket access failed:', bucketError.message);
      throw bucketError;
    }

    // Test upload permissions
    console.log('\n📤 Testing upload permissions...');
    const testKey = 'test/connection-test.txt';
    const testContent = 'S3 connection test - ' + new Date().toISOString();
    
    await s3.putObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain'
    }).promise();
    
    console.log('✅ Upload test successful!');

    // Clean up test file
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: testKey
    }).promise();
    
    console.log('✅ Delete test successful!');
    console.log('\n🎉 All S3 tests passed! Your configuration is ready for deployment.');

  } catch (error) {
    console.error('❌ S3 Test Failed:', error.message);
    
    if (error.code === 'NoSuchBucket') {
      console.log('💡 Tip: Make sure the bucket name is correct and exists in the specified region.');
    } else if (error.code === 'InvalidAccessKeyId') {
      console.log('💡 Tip: Check your AWS Access Key ID.');
    } else if (error.code === 'SignatureDoesNotMatch') {
      console.log('💡 Tip: Check your AWS Secret Access Key.');
    } else if (error.code === 'AccessDenied') {
      console.log('💡 Tip: Make sure your AWS credentials have the necessary S3 permissions.');
    }
  }
}

testS3Connection();
