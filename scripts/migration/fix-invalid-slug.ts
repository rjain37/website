/**
 * Fix the invalid slug for the latex.mdx post
 * 
 * This script finds the post with slug "." and updates it to "latex"
 * Run with: npx esno scripts/migration/fix-invalid-slug.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

initializeApp({
  credential: cert(serviceAccount as any),
});

const db = getFirestore();
const postsCollection = db.collection('posts');

async function fixInvalidSlug() {
  try {
    console.log('Finding post with invalid slug "."...');
    
    // Find the post with the problematic slug
    const querySnapshot = await postsCollection.where('slug', '==', '.').get();
    
    if (querySnapshot.empty) {
      console.log('No post with invalid slug found.');
      return;
    }
    
    console.log(`Found ${querySnapshot.size} post(s) with invalid slug.`);
    
    // Update each post with the problematic slug
    const updatePromises = querySnapshot.docs.map(async (doc) => {
      const postData = doc.data();
      console.log(`Updating post "${postData.title}" (ID: ${doc.id})...`);
      
      // Update the slug to "latex"
      await doc.ref.update({
        slug: 'latex',
        updatedAt: new Date()
      });
      
      console.log(`Updated post slug to "latex"`);
      return doc.id;
    });
    
    await Promise.all(updatePromises);
    console.log('All invalid slugs have been fixed successfully!');
    
  } catch (error) {
    console.error('Error fixing invalid slugs:', error);
  }
}

// Run the fix
fixInvalidSlug().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
