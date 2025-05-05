/**
 * Upload post images to Firebase Storage
 * 
 * This script scans MDX files for image references and uploads the images to Firebase Storage
 * Run with: npx esno scripts/migration/upload-images-to-firebase.ts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
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
const storage = getStorage();
// Firebase Storage bucket could be in different formats, let's try the standard format
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'website-2e501';

// Try the standard bucket name format first (this is the most common format)
const standardBucketName = `${projectId}.appspot.com`;

// If an explicit bucket name is provided, use that instead
const configuredBucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET;

// Use the provided bucket name or fall back to the standard format
const storageBucketName = configuredBucketName || standardBucketName;

console.log(`Project ID: ${projectId}`);
console.log(`Using storage bucket: ${storageBucketName}`);

const bucket = storage.bucket(storageBucketName);

// Path to your posts directory
const POSTS_PATH = path.join(process.cwd(), 'posts');

// Regular expression to find image references in MDX content
const imageRegex = /!\[(.*?)\]\((.*?)\)/g;

/**
 * Extract image paths from MDX content
 */
function extractImagePaths(content: string): { altText: string; path: string }[] {
  const images: { altText: string; path: string }[] = [];
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const altText = match[1];
    const imagePath = match[2];
    
    // Only process relative paths (not external URLs)
    if (!imagePath.startsWith('http') && !imagePath.startsWith('data:')) {
      images.push({ altText, path: imagePath });
    }
  }

  return images;
}

/**
 * Upload an image to Firebase Storage
 */
async function uploadImageToStorage(
  localImagePath: string, 
  postSlug: string, 
  imageName: string
): Promise<string> {
  // Format destination path: blog-images/{postSlug}/{imageName}
  const storagePath = `blog-images/${postSlug}/${imageName}`;
  
  console.log(`Uploading ${localImagePath} to ${storagePath}`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(localImagePath)) {
      console.error(`Image file not found: ${localImagePath}`);
      return '';
    }
    
    // Upload the file
    await bucket.upload(localImagePath, {
      destination: storagePath,
      metadata: {
        contentType: `image/${path.extname(imageName).substring(1)}`,
        cacheControl: 'public, max-age=31536000',
      },
    });
    
    // Make the file publicly accessible
    await bucket.file(storagePath).makePublic();
    
    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    console.log(`Uploaded to: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading image ${localImagePath}:`, error);
    return '';
  }
}

/**
 * Process a single post file, upload its images, and update the content
 */
async function processPost(filePath: string): Promise<void> {
  try {
    const relativePath = path.relative(POSTS_PATH, filePath);
    const postDir = path.dirname(filePath);
    console.log(`\nProcessing post: ${relativePath}`);
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Get slug from the relative path
    let slug = path.basename(path.dirname(relativePath));
    if (slug === 'posts') {
      slug = path.basename(filePath, path.extname(filePath));
    } else {
      // Remove the date part if present
      slug = slug.replace(/\s*\(\w+ \d{4}\)$/, '');
    }
    
    // Extract image paths
    const images = extractImagePaths(content);
    console.log(`Found ${images.length} images in ${slug}`);
    
    if (images.length === 0) {
      console.log('No images to process');
      return;
    }
    
    // Fetch the existing post from Firestore
    const postsRef = db.collection('posts');
    const querySnapshot = await postsRef.where('slug', '==', slug).get();
    
    if (querySnapshot.empty) {
      console.log(`No post found with slug "${slug}", skipping`);
      return;
    }
    
    const postDoc = querySnapshot.docs[0];
    let postContent = postDoc.data().content;
    
    // Process each image
    for (const image of images) {
      // Handle relative or absolute paths
      let imagePath = image.path;
      if (imagePath.startsWith('./') || imagePath.startsWith('../')) {
        imagePath = path.resolve(postDir, imagePath);
      } else if (!path.isAbsolute(imagePath)) {
        imagePath = path.resolve(postDir, imagePath);
      }
      
      // Get just the image filename
      const imageName = path.basename(imagePath);
      
      // Upload the image and get the public URL
      const imageUrl = await uploadImageToStorage(imagePath, slug, imageName);
      
      if (imageUrl) {
        // Replace the local image reference with the Firebase Storage URL in the post content
        // We need to escape special characters in the path for regex
        const escapedPath = image.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const imageRegexStr = `!\\[(${image.altText})\\]\\(${escapedPath}\\)`;
        const imageRegex = new RegExp(imageRegexStr, 'g');
        
        postContent = postContent.replace(imageRegex, `![${image.altText}](${imageUrl})`);
      }
    }
    
    // Update the post in Firestore with the modified content
    await postDoc.ref.update({
      content: postContent,
      updatedAt: new Date(),
    });
    
    console.log(`Post "${slug}" updated with Firebase Storage image URLs`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

/**
 * Recursively get all MDX files from a directory
 */
function getMDXFiles(dir: string): string[] {
  const files: string[] = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...getMDXFiles(fullPath));
    } else if (entry.name.endsWith('.mdx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Main function to process all posts and upload images
 */
async function uploadPostImages() {
  try {
    console.log('Starting image upload to Firebase Storage...');
    
    const files = getMDXFiles(POSTS_PATH);
    console.log(`Found ${files.length} MDX files to process`);
    
    // Process each file
    for (const file of files) {
      await processPost(file);
    }
    
    console.log('\nImage migration complete!');
  } catch (error) {
    console.error('Error during image migration:', error);
  }
}

// Run the migration
uploadPostImages().then(() => {
  console.log('All done!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
