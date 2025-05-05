import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * API route that serves blog post images directly from the posts directory
 * This allows Firebase-stored blog posts to reference local images
 * 
 * Usage: /api/blog-image/[slug]/[imageName]
 * Example: /api/blog-image/wisdom_of_water/mesleeping.jpeg
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: pathQuery } = req.query;
  
  if (!pathQuery || !Array.isArray(pathQuery) || pathQuery.length < 2) {
    return res.status(400).json({ error: 'Invalid image path' });
  }
  
  const [slug, ...imageNameParts] = pathQuery;
  const imageName = imageNameParts.join('/');
  
  // Look for the image in posts directory
  const postsDir = path.join(process.cwd(), 'posts');
  
  // Look for directory that starts with the slug
  const dirs = fs.readdirSync(postsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && (dirent.name.startsWith(slug) || dirent.name.includes(slug)))
    .map(dirent => dirent.name);
  
  if (dirs.length === 0) {
    console.error(`Post directory not found for slug: ${slug}`);
    // Return a placeholder image instead of a 404
    return serveImagePlaceholder(res, slug, imageName);
  }
  
  const postDir = dirs[0];
  const imageFilePath = path.join(postsDir, postDir, imageName);
  
  if (!fs.existsSync(imageFilePath)) {
    console.error(`Image not found: ${imageFilePath}`);
    // Return a placeholder image instead of a 404
    return serveImagePlaceholder(res, slug, imageName);
  }
  
  // Determine content type
  const ext = path.extname(imageName).toLowerCase();
  const contentType = ext === '.jpg' || ext === '.jpeg' 
    ? 'image/jpeg' 
    : ext === '.png' 
      ? 'image/png'
      : ext === '.gif'
        ? 'image/gif'
        : 'application/octet-stream';
  
  const imageBuffer = fs.readFileSync(imageFilePath);
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.status(200).send(imageBuffer);
}

/**
 * Generate a placeholder SVG image for missing images
 */
function serveImagePlaceholder(res: NextApiResponse, slug: string, imageName: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
      <rect width="800" height="400" fill="#f0f0f0" />
      <text x="400" y="150" font-family="Arial" font-size="24" text-anchor="middle" fill="#888">
        Image Not Found
      </text>
      <text x="400" y="190" font-family="Arial" font-size="16" text-anchor="middle" fill="#888">
        ${imageName}
      </text>
      <text x="400" y="230" font-family="Arial" font-size="14" text-anchor="middle" fill="#888">
        Post: ${slug}
      </text>
    </svg>
  `;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(svg);
}
