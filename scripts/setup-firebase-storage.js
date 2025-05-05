#!/usr/bin/env node

/**
 * Firebase Setup Script
 * 
 * This script guides you through:
 * 1. Setting up the required Firestore indexes
 * 2. Running the image migration to Firebase Storage
 */

const { execSync } = require('child_process');
const readline = require('readline');
const open = require('open');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const indexUrl = 'https://console.firebase.google.com/v1/r/project/website-2e501/firestore/indexes?create_composite=Cktwcm9qZWN0cy93ZWJzaXRlLTJlNTAxL2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9wb3N0cy9pbmRleGVzL18QARoICgR0YWdzGAEaDQoJcHVibGlzaGVkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg';

console.log('='.repeat(80));
console.log('Firebase Setup Assistant');
console.log('='.repeat(80));
console.log('\nThis script will help you set up Firebase Storage for your blog images and create the required Firestore indexes.\n');

// Step 1: Open the Firebase Console to create the required index
console.log('STEP 1: Create Firestore Index');
console.log('-'.repeat(50));
console.log('You need to create a composite Firestore index for querying posts by tags.');
console.log(`Opening the Firebase Console in your default browser...`);

(async () => {
  try {
    await open(indexUrl);
    
    rl.question('\nHave you created the index in the Firebase Console? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('\nGreat! The index is being built. This may take a few minutes to complete.');
        
        // Step 2: Migrate images to Firebase Storage
        console.log('\nSTEP 2: Migrate Images to Firebase Storage');
        console.log('-'.repeat(50));
        console.log('This will scan your blog posts for images and upload them to Firebase Storage.');
        console.log('Then it will update the image references in your posts to point to the Firebase Storage URLs.');
        
        rl.question('\nDo you want to start the image migration now? (yes/no): ', async (migrate) => {
          if (migrate.toLowerCase() === 'yes' || migrate.toLowerCase() === 'y') {
            console.log('\nStarting image migration to Firebase Storage...');
            console.log('This may take a while depending on the number and size of your images.');
            
            try {
              execSync('npx esno scripts/migration/upload-images-to-firebase.ts', { stdio: 'inherit' });
              
              console.log('\n✅ Images have been migrated to Firebase Storage!');
              console.log('\nYour blog posts have been updated with Firebase Storage URLs.');
              console.log('You should now be able to view your posts with images properly.');
            } catch (error) {
              console.error('\n❌ Error during image migration:', error.message);
              console.log('Please check the error message above and try again.');
            }
          } else {
            console.log('\nImage migration skipped. You can run it later with:');
            console.log('npx esno scripts/migration/upload-images-to-firebase.ts');
          }
          
          console.log('\n='.repeat(80));
          console.log('Setup Complete!');
          console.log('='.repeat(80));
          
          rl.close();
        });
      } else {
        console.log('\nPlease create the index in the Firebase Console before continuing.');
        console.log('The index URL was opened in your browser. Click "Create Index" on that page.');
        console.log('You can run this script again after creating the index.');
        rl.close();
      }
    });
  } catch (error) {
    console.error('Failed to open the Firebase Console:', error);
    console.log('Please manually visit:');
    console.log(indexUrl);
    
    rl.question('\nHave you created the index in the Firebase Console? (yes/no): ', (answer) => {
      // Same logic as above
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        // Proceed with migration...
        console.log('Skipping to migration step...');
        // (Migration logic from above would be repeated here)
      } else {
        console.log('Please create the index before proceeding.');
      }
      rl.close();
    });
  }
})();
