import { NextApiRequest, NextApiResponse } from 'next';

/**
 * API route that returns a placeholder image SVG for missing images
 * This allows the MDX bundler to continue building without failing
 * when local image references exist in Firebase-stored posts
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  const imageName = Array.isArray(name) ? name[0] : name || 'unknown-image';

  // Create an SVG placeholder with the image name
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
      <rect width="800" height="400" fill="#f0f0f0" />
      <text x="400" y="170" font-family="Arial" font-size="24" text-anchor="middle" fill="#888">
        Image Placeholder
      </text>
      <text x="400" y="210" font-family="Arial" font-size="16" text-anchor="middle" fill="#888">
        ${imageName}
      </text>
      <text x="400" y="250" font-family="Arial" font-size="14" text-anchor="middle" fill="#888">
        This image needs to be migrated to Firebase Storage
      </text>
    </svg>
  `;

  // Set appropriate headers
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  
  // Return the SVG
  res.status(200).send(svg);
}
