import type { Root, Element } from 'hast';
import visit from 'unist-util-visit';
import sizeOf from 'image-size';
import type { ISizeCalculationResult } from 'image-size/dist/types/interface';
import fs from 'fs';
import path from 'path';
import { ffprobe } from 'node-ffprobe';
import ffprobeStatic from 'ffprobe-static';
import os from 'os';

interface ImageSizeOptions {
  dir: string;
}

/**
 * Rehype plugin to add width and height to images and videos
 */
function rehypeImageSize(options: ImageSizeOptions) {
  const dir = options.dir;
  
  return async function transformer(tree: Root) {
    const promises: Promise<void>[] = [];
    
    // Process <img> elements
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'img' && node.properties && typeof node.properties.src === 'string') {
        const src = node.properties.src as string;
        
        // Skip if already has dimensions
        if (node.properties?.width && node.properties?.height) {
          return;
        }
        
        // Skip external images
        if (src.startsWith('http://') || src.startsWith('https://')) {
          return;
        }
        
        if (src.endsWith('.mp4') || src.endsWith('.webm')) {
          promises.push(
            getVideoSize(path.join(dir, src))
              .then(({ width, height }) => {
                // Add null check to ensure properties is still defined
                if (width && height && node.properties) {
                  node.properties.width = width;
                  node.properties.height = height;
                }
              })
              .catch(error => {
                console.error(`Failed to get video dimensions for ${src}:`, error);
              })
          );
        } else {
          // Handle image files
          try {
            const filePath = path.join(dir, src);
            if (fs.existsSync(filePath)) {
              try {
                // TypeScript-compliant way to call sizeOf with a file path
                const dimensions: ISizeCalculationResult = sizeOf(filePath as any);
                if (dimensions.width && dimensions.height && node.properties) {
                  node.properties.width = dimensions.width;
                  node.properties.height = dimensions.height;
                }
              } catch (error) {
                console.error(`Failed to get image dimensions for ${src}:`, error);
              }
            }
          } catch (error) {
            console.error(`Failed to get image dimensions for ${src}:`, error);
          }
        }
      }
    });
    
    // Wait for all video dimension promises to resolve
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    
    return tree;
  };
}

/**
 * Get dimensions for video files
 */
async function getVideoSize(filePath: string): Promise<{ width: number; height: number }> {
  if (!fs.existsSync(filePath)) {
    return { width: 0, height: 0 };
  }
  
  const ffprobePath = os.platform() === 'darwin' && os.arch() !== 'x64'
    ? '/opt/homebrew/bin/ffprobe'
    : ffprobeStatic.path;
  
  try {
    const info = await ffprobe(filePath, ffprobePath);
    const videoStream = info.streams?.find(stream => stream.codec_type === 'video');
    
    return {
      width: videoStream?.width || 0,
      height: videoStream?.height || 0
    };
  } catch (error) {
    console.error(`Error analyzing video: ${filePath}`, error);
    return { width: 0, height: 0 };
  }
}

export default rehypeImageSize;
