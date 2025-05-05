/**
 * Simple test script to verify Firebase Storage access
 * Run with: npx esno scripts/test-firebase-storage.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('Firebase Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Firebase Storage Bucket (from env):', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

// Initialize Firebase Admin with verbose logging
try {
  console.log('Initializing Firebase Admin...');
  
  // Check if we have the necessary credentials
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error('Missing required Firebase credentials in .env.local file');
    console.log('Required variables:');
    console.log('- FIREBASE_PROJECT_ID');
    console.log('- FIREBASE_CLIENT_EMAIL');
    console.log('- FIREBASE_PRIVATE_KEY');
    process.exit(1);
  }
  
  // Initialize with service account
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  
  console.log('Service account project ID:', serviceAccount.projectId);
  console.log('Service account email:', serviceAccount.clientEmail);
  console.log('Private key length:', serviceAccount.privateKey ? serviceAccount.privateKey.length : 0);
  
  initializeApp({
    credential: cert(serviceAccount as any),
  });
  
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

// Test Storage access
try {
  console.log('\nTesting Storage access...');
  
  const storage = getStorage();
  
  // Since we can't list buckets directly, try accessing specific buckets
  
  // First try the standard bucket format
  const standardBucketName = `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
  console.log(`Attempting to access standard bucket: ${standardBucketName}`);
  
  const standardBucket = storage.bucket(standardBucketName);
  
  standardBucket.exists().then(([exists]) => {
    console.log(`Standard bucket exists: ${exists}`);
    
    if (exists) {
      console.log('👍 The standard bucket exists and is accessible!');
      console.log(`Use this bucket name in your script: ${standardBucketName}`);
      
      // Try listing files to verify full access
      return standardBucket.getFiles().then(([files]) => {
        console.log(`Found ${files.length} files in standard bucket`);
        return true;
      }).catch(error => {
        console.error('Error listing files in standard bucket:', error.message);
        return false;
      });
    } else {
      console.log('❌ Standard bucket does not exist or is not accessible.');
      return false;
    }
  }).then((standardBucketWorks) => {
    // If we have a custom bucket configured, try that too
    if (!standardBucketWorks && process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
      const configuredBucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      console.log(`\nAttempting to access configured bucket: ${configuredBucketName}`);
      
      const configuredBucket = storage.bucket(configuredBucketName);
      
      return configuredBucket.exists().then(([exists]) => {
        console.log(`Configured bucket exists: ${exists}`);
        
        if (exists) {
          console.log('👍 The configured bucket exists and is accessible!');
          console.log(`Use this bucket name in your script: ${configuredBucketName}`);
          
          // Try listing files to verify full access
          return configuredBucket.getFiles().then(([files]) => {
            console.log(`Found ${files.length} files in configured bucket`);
            return true;
          }).catch(error => {
            console.error('Error listing files in configured bucket:', error.message);
            return false;
          });
        } else {
          console.log('❌ Configured bucket does not exist or is not accessible.');
          return false;
        }
      });
    }
    return standardBucketWorks;
  }).then((anyBucketWorks) => {
    if (!anyBucketWorks) {
      console.log('\n❌ No accessible Firebase Storage buckets found!');
      console.log('This could be because:');
      console.log('1. Firebase Storage hasn\'t been enabled for your project');
      console.log('2. The service account doesn\'t have Storage permissions');
      console.log('3. The bucket name is incorrect');
      console.log('\nTo fix this:');
      console.log('- Go to Firebase Console → Storage → Get Started');
      console.log('- Verify service account permissions in Firebase Console → Project Settings → Service Accounts');
    }
    
    console.log('\nStorage access test complete.');
  }).catch((error) => {
    console.error('Error accessing storage buckets:', error);
  });
} catch (error) {
  console.error('Error testing Storage access:', error);
}
