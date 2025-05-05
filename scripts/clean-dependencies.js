#!/usr/bin/env node

/**
 * Script to clean up unnecessary dependencies
 * Run with: node scripts/clean-dependencies.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Dependencies to consider moving to devDependencies
const prodToDevDependencies = [
  '@next/bundle-analyzer',
  'eslint',
  'eslint-config-next',
  'typescript'
];

// Check for unused dependencies
function checkUnusedDependencies() {
  console.log('\nChecking for unused dependencies...');
  
  try {
    console.log('Installing depcheck tool...');
    execSync('npm install -g depcheck', { stdio: 'inherit' });
    
    console.log('\nRunning depcheck...');
    const result = execSync('npx depcheck', { encoding: 'utf8' });
    console.log(result);
  } catch (error) {
    console.log('Depcheck found unused dependencies. Review the output above.');
  }
}

// Move production dependencies to dev dependencies
function moveToDev() {
  console.log('\nMoving development dependencies from production to devDependencies...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = require(packageJsonPath);
  
  let count = 0;
  
  // Move specified dependencies to devDependencies
  for (const dep of prodToDevDependencies) {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      // Create devDependencies if it doesn't exist
      if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
      }
      
      // Move dependency
      packageJson.devDependencies[dep] = packageJson.dependencies[dep];
      delete packageJson.dependencies[dep];
      count++;
      console.log(`✅ Moved ${dep} to devDependencies`);
    }
  }
  
  if (count === 0) {
    console.log('No dependencies were moved.');
  } else {
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Updated package.json - moved ${count} dependencies to devDependencies`);
  }
}

// Optimize Firebase imports
function optimizeFirebaseImports() {
  console.log('\nChecking for optimizable Firebase imports...');
  
  // Find all TypeScript and JavaScript files
  const findJsFiles = execSync('find . -type f -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./out/*" \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\)', { encoding: 'utf8' }).trim().split('\n');
  
  let foundFirebaseImports = false;
  
  for (const file of findJsFiles) {
    if (!file) continue;
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for Firebase imports
    if (content.includes('firebase-admin')) {
      foundFirebaseImports = true;
      console.log(`Found Firebase imports in: ${file}`);
    }
  }
  
  if (foundFirebaseImports) {
    console.log('\nTip: Consider using specific Firebase imports instead of full package:');
    console.log('  Instead of: import * as admin from "firebase-admin"');
    console.log('  Use: import { firestore, storage } from "firebase-admin"');
    console.log('  Or even better: import { Firestore } from "@google-cloud/firestore"');
  } else {
    console.log('No Firebase imports found that need optimization.');
  }
}

// Create .vercelignore file
function createVercelIgnore() {
  console.log('\nCreating .vercelignore file for deployment optimization...');
  
  const vercelIgnorePath = path.join(process.cwd(), '.vercelignore');
  const ignoreContent = `.git
.github
.next/cache
node_modules
scripts/migration
scripts/test-*.ts
scripts/test-*.js
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local
`;
  
  fs.writeFileSync(vercelIgnorePath, ignoreContent);
  console.log('✅ Created .vercelignore file');
}

// Update .gitignore
function updateGitIgnore() {
  console.log('\nUpdating .gitignore for better exclusions...');
  
  const gitIgnorePath = path.join(process.cwd(), '.gitignore');
  let gitIgnoreContent = '';
  
  if (fs.existsSync(gitIgnorePath)) {
    gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf8');
  }
  
  const additionalContent = `
# Large media files
*.mp4
*.mov
*.webm
*.psd
*.ai
*.sketch

# Cache and build
.next/cache
dist

# Logs and debugging
debug.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories
.idea
.vscode
*.swp
*.swo
`;

  // Only add lines that don't already exist
  const newLines = additionalContent.split('\n').filter(line => !gitIgnoreContent.includes(line));
  
  if (newLines.length > 0) {
    fs.appendFileSync(gitIgnorePath, '\n' + newLines.join('\n'));
    console.log(`✅ Updated .gitignore with ${newLines.length} new exclusions`);
  } else {
    console.log('No updates needed for .gitignore');
  }
}

// Main function
async function main() {
  console.log('Starting dependency cleanup process...');
  
  // Create .vercelignore
  createVercelIgnore();
  
  // Update .gitignore
  updateGitIgnore();
  
  // Move dev dependencies
  moveToDev();
  
  // Check for unused dependencies
  checkUnusedDependencies();
  
  // Optimize Firebase imports
  optimizeFirebaseImports();
  
  console.log('\nDependency cleanup process complete!');
  console.log('\nRecommended next steps:');
  console.log('1. Run "npm prune" to remove unused dependencies');
  console.log('2. Run "npm install" to update your node_modules');
  console.log('3. Run "node scripts/optimize-images.js" to optimize your images');
}

// Run the cleanup
main().catch(error => {
  console.error('Error during dependency cleanup:', error);
  process.exit(1);
});
