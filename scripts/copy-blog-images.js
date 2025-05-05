#!/usr/bin/env node

/**
 * Script to copy blog post images to the public directory
 * This ensures images are directly accessible in production
 * Run with: node scripts/copy-blog-images.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to your posts directory
const POSTS_PATH = path.join(process.cwd(), 'posts');
// Target directory for images
const PUBLIC_IMAGES_PATH = path.join(process.cwd(), 'public', 'images', 'posts');

// Ensure the public images directory exists
if (!fs.existsSync(PUBLIC_IMAGES_PATH)) {
  fs.mkdirSync(PUBLIC_IMAGES_PATH, { recursive: true });
}

// Regular expression to find image references in MDX content
const imageRegex = /!\[(.*?)\]\(\.\/(.*?)\)/g;

/**
 * Extract image paths from MDX content
 */
function extractImagePaths(content) {
  const images = [];
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
 * Copy an image to the public directory
 */
function copyImageToPublic(postDir, imageName, slug) {
  const sourcePath = path.join(POSTS_PATH, postDir, imageName);
  const targetDir = path.join(PUBLIC_IMAGES_PATH, slug);
  const targetPath = path.join(targetDir, imageName);
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`Image file not found: ${sourcePath}`);
    return false;
  }
  
  // Copy the file
  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied: ${imageName} to ${targetPath}`);
    return true;
  } catch (error) {
    console.error(`Error copying image ${sourcePath}:`, error);
    return false;
  }
}

/**
 * Process a single post directory
 */
function processPostDirectory(dirName) {
  // Extract slug from directory name
  let slug = dirName;
  
  // Remove the date part if present
  slug = slug.replace(/\s*\(\w+ \d{4}\)$/, '');
  
  const mdxFiles = fs.readdirSync(path.join(POSTS_PATH, dirName))
    .filter(file => file.endsWith('.mdx'));
  
  if (mdxFiles.length === 0) {
    return;
  }
  
  // Process each MDX file
  for (const mdxFile of mdxFiles) {
    const filePath = path.join(POSTS_PATH, dirName, mdxFile);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract image paths
    const images = extractImagePaths(content);
    
    if (images.length === 0) {
      continue;
    }
    
    console.log(`Found ${images.length} images in ${slug}`);
    
    // Copy each image
    for (const image of images) {
      copyImageToPublic(dirName, image.path, slug);
    }
  }
}

/**
 * Main function
 */
function main() {
  console.log('Copying blog post images to public directory...');
  
  // Get all post directories
  const postDirs = fs.readdirSync(POSTS_PATH, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`Found ${postDirs.length} post directories`);
  
  // Process each post directory
  for (const dirName of postDirs) {
    processPostDirectory(dirName);
  }
  
  console.log('\nDone copying images!');
  console.log(`Images are now available at /images/posts/{slug}/{image}`);
}

main();
