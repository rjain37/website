/**
 * Import existing posts from the local filesystem to Firebase
 * 
 * This script reads all MDX files in the posts directory and uploads them to Firebase
 * Run with: npx esno scripts/migration/import-posts-to-firebase.ts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
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

// Path to your posts directory
const POSTS_PATH = path.join(process.cwd(), 'posts');

interface PostMetadata {
  title: string;
  date?: string | Date;
  preview?: string;
  tags?: string[];
  published?: boolean;
  [key: string]: any;
}

/**
 * Parse a date string into a Date object
 */
function parseDate(dateStr: string): Date {
  // Try as ISO string
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try MM-DD-YYYY or MM/DD/YYYY format
  let parsed: number[];
  if (dateStr.search("-") !== -1) {
    parsed = dateStr.split("-").map((s) => parseInt(s));
  } else {
    parsed = dateStr.split("/").map((s) => parseInt(s));
  }

  // If first number is > 12, assume YYYY-MM-DD
  if (parsed[0] > 12) {
    return new Date(parsed[0], parsed[1] - 1, parsed[2]);
  }

  // Otherwise assume MM-DD-YYYY
  if (parsed[2] < 1000) {
    parsed[2] += 2000;
  }

  return new Date(parsed[2], parsed[0] - 1, parsed[1]);
}

/**
 * Get a directory name and extract the date from it (if in the format 'title (month year)')
 */
function extractDateFromDirName(dirName: string): Date | null {
  const match = dirName.match(/\((\w+ \d{4})\)$/);
  if (match) {
    const dateStr = match[1]; // e.g., "august 2023"
    const [month, yearStr] = dateStr.split(' ');
    const year = parseInt(yearStr);
    
    const monthMap: Record<string, number> = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
      'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11
    };
    
    const monthIndex = monthMap[month.toLowerCase()];
    if (monthIndex !== undefined && !isNaN(year)) {
      return new Date(year, monthIndex, 15); // Default to middle of the month
    }
  }
  return null;
}

/**
 * Extract slug from file path
 */
function getSlugFromPath(filePath: string): string {
  const dirName = path.dirname(filePath);
  const baseDirName = path.basename(dirName);
  
  // If it's in a subdirectory, use the directory name (removing the date part)
  if (baseDirName !== 'posts') {
    return baseDirName.replace(/\s*\(\w+ \d{4}\)$/, '');
  }
  
  // Otherwise use the file name
  return path.basename(filePath, path.extname(filePath));
}

/**
 * Process a single post file and upload it to Firebase
 */
async function processPost(filePath: string): Promise<void> {
  try {
    const relativePath = path.relative(POSTS_PATH, filePath);
    console.log(`Processing: ${relativePath}`);
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Get the slug from the directory or file name
    const slug = getSlugFromPath(relativePath);
    
    // Get the date from either the frontmatter or the directory name
    let createdAt: Date;
    if (data.date) {
      createdAt = typeof data.date === 'string' ? parseDate(data.date) : data.date;
    } else {
      const dirDate = extractDateFromDirName(path.dirname(relativePath));
      createdAt = dirDate || new Date();
    }
    
    // Prepare post data for Firebase
    const postData = {
      title: data.title || slug,
      slug,
      content,
      preview: data.preview || '',
      tags: data.tags || [],
      published: data.published !== false, // Default to published
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: Timestamp.fromDate(new Date()),
      author: {
        email: process.env.ALLOWED_EMAIL,
        name: 'Rohan Jain',
      },
      importedFromFile: relativePath,
    };
    
    // Check if a post with this slug already exists
    const existingPostsQuery = await postsCollection.where('slug', '==', slug).get();
    
    if (!existingPostsQuery.empty) {
      console.log(`Post with slug "${slug}" already exists, updating...`);
      await postsCollection.doc(existingPostsQuery.docs[0].id).update(postData);
    } else {
      console.log(`Creating new post with slug "${slug}"...`);
      await postsCollection.add(postData);
    }
    
    console.log(`Successfully processed: ${slug}`);
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
 * Main function to import all posts
 */
async function importPosts() {
  try {
    console.log('Starting post import to Firebase...');
    
    const files = getMDXFiles(POSTS_PATH);
    console.log(`Found ${files.length} MDX files to process`);
    
    // Process files sequentially to avoid rate limiting
    for (const file of files) {
      await processPost(file);
    }
    
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Error importing posts:', error);
  }
}

// Run the import
importPosts().then(() => {
  console.log('All done!');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
