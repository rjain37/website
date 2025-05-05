// Based on https://github.com/ksoichiro/rehype-img-size
import type { Element, Root } from 'hast';
import sizeOf from 'image-size';
import { ffprobe } from 'node-ffprobe';
import ffprobeStatic from 'ffprobe-static';
import path from 'path';
import os from 'os';
import visit from 'unist-util-visit';
import type { Node } from 'unist';
import fs from 'fs';

// Helper function to handle async operations
const visitAsync = async (tree: Node, matcher: any, asyncVisitor: (node: Element, index: number, parent: Node) => Promise<void>) => {
  const matches: Array<[Element, number, Node]> = [];
  
  visit(tree, matcher, (node: Element, index: number, parent: Node) => {
    matches.push([node, index, parent]);
  });

  const promises = matches.map(([node, index, parent]) => asyncVisitor(node, index, parent));
  await Promise.all(promises);

  return tree;
};

// Directory to resolve relative paths
let dir: string;

// Get image dimensions
const getImageSize = (src: string) => {
  try {
    const fullPath = path.join(dir, src);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Image not found: ${fullPath}`);
      return { width: 0, height: 0 };
    }
    const dimensions = sizeOf(fullPath);
    return {
      width: dimensions.width || 0,
      height: dimensions.height || 0
    };
  } catch (error) {
    console.error(`Error getting image size for ${src}:`, error);
    return { width: 0, height: 0 };
  }
};

// Get video dimensions
const getVideoSize = async (src: string) => {
  try {
    const fullPath = path.join(dir, src);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Video not found: ${fullPath}`);
      return { width: 0, height: 0 };
    }
    
    const ffprobePath = os.platform() === "darwin" && os.arch() !== "x64"
      ? "/opt/homebrew/bin/ffprobe"
      : ffprobeStatic.path;
    
    const info = await ffprobe(fullPath, ffprobePath);
    
    return {
      width: info.streams?.[0]?.width || 0,
      height: info.streams?.[0]?.height || 0,
    };
  } catch (error) {
    console.error(`Error getting video size for ${src}:`, error);
    return { width: 0, height: 0 };
  }
};

const setImageSize = (options: { dir: string }) => {
  dir = options.dir;
  return transform;
};
// Track imports for mdx/jsx
const imports: { name: any; source: any }[] = [];

const transform = async (tree: Root) => {
  visit(tree, "mdxjsEsm", onimport);
  await visitAsync(tree, "mdxJsxTextElement", onelement); 
};

const onimport = (node: any) => {
  let name;
  const names = [];
  for (const imp of node.data.estree.body[0].specifiers) {
    if (imp.type === "ImportDefaultSpecifier") {
      name = imp.local.name;
    } else if (imp.type === "ImportSpecifier") {
      names.push(imp.local.name);
    }
  }
  const source = node.data.estree.body[0].source.value;
  if (source.endsWith(".jpg") || source.endsWith(".png") || source.endsWith(".jpeg") || source.endsWith(".mp4") || source.endsWith(".webm")) {
    imports.push({ name, source });
    for (const n of names) {
      imports.push({ name: n, source });
    }
  }
};

const onelement = async (node: any) => {
  if (node.name === "img") {
    const srcAttribute = node.attributes.find(
      (attr: any) => attr.name === "src"
    );
    if (srcAttribute) {
      const name = srcAttribute.value.value;
      const imgImport = imports.find((i) => i.name === name);
      if (imgImport) {
        let dims;
        if (imgImport.source.endsWith(".mp4")) {
          node.name = "video";
          dims = await getVideoSize(imgImport.source);
        } else {
          dims = getImageSize(imgImport.source);
        }
        node.attributes.push({
          type: "mdxJsxAttribute",
          name: "width",
          value: dims.width,
        });
        node.attributes.push({
          type: "mdxJsxAttribute",
          name: "height",
          value: dims.height,
        });
      }
    }
  }
};

export default setImageSize;
