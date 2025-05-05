#!/usr/bin/env node

/**
 * Script to optimize images for the website
 * Run with: node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if sharp is installed
try {
  require.resolve('sharp');
  console.log('Sharp is already installed');
} catch (e) {
  console.log('Installing sharp for image optimization...');
  execSync('npm install sharp --save-dev');
}

// Import sharp after ensuring it's installed
const sharp = require('sharp');

// Configure image optimization
const optimizationConfig = {
  profilePics: {
    width: 800,
    height: 800,
    quality: 80,
    keepOriginal: false, // Whether to keep the original files
  },
  projectImages: {
    width: 1200,
    quality: 80,
    keepOriginal: false,
  },
  photoImages: {
    width: 1600,
    quality: 85,
    keepOriginal: false,
  },
};

/**
 * Optimize an image file
 */
async function optimizeImage(filePath, config) {
  const { width, height, quality } = config;
  const originalSize = fs.statSync(filePath).size;
  
  // Parse file info
  const parsedPath = path.parse(filePath);
  const outputDir = path.join(parsedPath.dir, 'optimized');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create output filename
  const outputPath = path.join(outputDir, parsedPath.base);
  
  console.log(`Optimizing: ${filePath}`);
  
  try {
    // Start with basic sharp instance
    let sharpInstance = sharp(filePath).jpeg({ quality: quality, mozjpeg: true });
    
    // Resize if width is specified
    if (width) {
      if (height) {
        // Resize to exact dimensions if both width and height are specified
        sharpInstance = sharpInstance.resize(width, height, {
          fit: 'cover',
          position: 'center',
        });
      } else {
        // Resize maintaining aspect ratio if only width is specified
        sharpInstance = sharpInstance.resize(width, null, {
          withoutEnlargement: true,
        });
      }
    }
    
    // Save the optimized image
    await sharpInstance.toFile(outputPath);
    
    // Check size reduction
    const newSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);
    
    console.log(`✅ Reduced ${path.basename(filePath)} by ${reduction}% (${(originalSize/1024/1024).toFixed(2)}MB → ${(newSize/1024/1024).toFixed(2)}MB)`);
    
    // Replace original with optimized version if not keeping original
    if (!config.keepOriginal) {
      fs.unlinkSync(filePath); // Delete original
      fs.copyFileSync(outputPath, filePath); // Copy optimized to original location
      fs.unlinkSync(outputPath); // Remove the copy in the optimized folder
      console.log(`   Original file replaced with optimized version`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error optimizing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Optimize profile pictures
 */
async function optimizeProfilePics() {
  const publicImagesDir = path.join(process.cwd(), 'public', 'images');
  
  if (!fs.existsSync(publicImagesDir)) {
    console.log('Public images directory not found, skipping profile pics optimization');
    return;
  }
  
  console.log('\nOptimizing profile pictures...');
  
  // Find all profile pictures
  const profilePics = fs.readdirSync(publicImagesDir)
    .filter(file => file.startsWith('pfp') && (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')))
    .map(file => path.join(publicImagesDir, file));
  
  console.log(`Found ${profilePics.length} profile pictures`);
  
  // Keep only the one used in the website
  const usedProfilePic = profilePics.find(pic => pic.includes('pfp3.jpg'));
  
  if (usedProfilePic) {
    console.log(`Keeping used profile picture: ${path.basename(usedProfilePic)}`);
    
    // Optimize the used profile picture
    await optimizeImage(usedProfilePic, optimizationConfig.profilePics);
    
    // Delete unused profile pictures
    for (const pic of profilePics) {
      if (pic !== usedProfilePic) {
        console.log(`🗑️ Removing unused profile picture: ${path.basename(pic)}`);
        fs.unlinkSync(pic);
      }
    }
  } else {
    console.log('Used profile picture (pfp3.jpg) not found, optimizing all profile pictures');
    
    // Optimize all profile pictures
    for (const pic of profilePics) {
      await optimizeImage(pic, optimizationConfig.profilePics);
    }
  }
}

/**
 * Optimize project images
 */
async function optimizeProjectImages() {
  const projectsDir = path.join(process.cwd(), 'projects');
  
  if (!fs.existsSync(projectsDir)) {
    console.log('Projects directory not found, skipping project images optimization');
    return;
  }
  
  console.log('\nOptimizing project images...');
  
  // Find all project images
  const projectImages = fs.readdirSync(projectsDir)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'))
    .map(file => path.join(projectsDir, file));
  
  console.log(`Found ${projectImages.length} project images`);
  
  // Optimize all project images
  for (const img of projectImages) {
    await optimizeImage(img, optimizationConfig.projectImages);
  }
}

/**
 * Optimize photos
 */
async function optimizePhotos() {
  const photosDir = path.join(process.cwd(), 'public', 'photos');
  
  if (!fs.existsSync(photosDir)) {
    console.log('Photos directory not found, skipping photos optimization');
    return;
  }
  
  console.log('\nOptimizing photos...');
  
  // Find all photos
  const photos = fs.readdirSync(photosDir)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'))
    .map(file => path.join(photosDir, file));
  
  console.log(`Found ${photos.length} photos`);
  
  // Optimize all photos
  for (const photo of photos) {
    await optimizeImage(photo, optimizationConfig.photoImages);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting image optimization...');
  
  await optimizeProfilePics();
  await optimizeProjectImages();
  await optimizePhotos();
  
  console.log('\nImage optimization complete!');
}

// Run the optimization
main().catch(error => {
  console.error('Error during image optimization:', error);
  process.exit(1);
});
