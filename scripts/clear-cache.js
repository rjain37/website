#!/usr/bin/env node

/**
 * Script to clear Next.js cache before and after build
 * This helps prevent the webpack cache from growing too large
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cache directory to clear
const CACHE_DIR = path.join(process.cwd(), '.next', 'cache');
const WEBPACK_CACHE_DIR = path.join(CACHE_DIR, 'webpack');

/**
 * Clear Next.js cache directories
 */
function clearCache() {
  console.log('Clearing Next.js cache...');
  
  if (fs.existsSync(WEBPACK_CACHE_DIR)) {
    // Remove webpack cache
    console.log(`Removing webpack cache at ${WEBPACK_CACHE_DIR}`);
    try {
      fs.rmSync(WEBPACK_CACHE_DIR, { recursive: true, force: true });
      console.log('✅ Webpack cache cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear webpack cache:', error);
    }
  } else {
    console.log('Webpack cache directory does not exist, nothing to clear');
  }
}

/**
 * Run the Next.js build command with limited cache
 */
function runOptimizedBuild() {
  console.log('\nRunning optimized Next.js build...');
  
  try {
    // Set environment variables to limit cache
    process.env.NODE_ENV = 'production';
    
    // Run the build command
    execSync('node scripts/copy-blog-images.js && next build --webpack', {
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
        // Limit memory usage during build
        NODE_OPTIONS: '--max-old-space-size=2048'
      }
    });
    
    console.log('✅ Build completed successfully');
    
    // Clear cache after build
    clearCache();
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// If directly executed
if (require.main === module) {
  // Clear cache before building
  clearCache();
  
  // Run the build
  runOptimizedBuild();
}

module.exports = {
  clearCache,
  runOptimizedBuild
};
