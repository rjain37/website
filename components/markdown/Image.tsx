import { useState, useEffect } from "react";
import NextImage, { ImageProps as NextImageProps } from "next/image";

// Extend the ImageProps type to handle both string and object src
interface ImageProps extends Omit<NextImageProps, 'src'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

const Image = (props: ImageProps) => {
  const { src, alt, width, height, ...rest } = props;
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [dimensions, setDimensions] = useState<{width?: number, height?: number}>({
    width: width || 800,
    height: height
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setImgSrc(src);
    setIsLoading(true);
    setError(false);
  }, [src]);

  // Determine if this is a remote URL (absolute) or a local image reference
  const isRemoteUrl = typeof src === 'string' && 
    (src.startsWith('http://') || 
     src.startsWith('https://') ||
     src.startsWith('data:'));

  // Determine if this is a local relative path
  const isLocalRelativePath = typeof src === 'string' && 
    (src.startsWith('./') || src.startsWith('../') || (!src.startsWith('/') && !isRemoteUrl));

  // For Firebase-stored blog posts with local file references
  if (isLocalRelativePath) {
    // Extract post slug from context if possible, or fallback mechanism
    // This is tricky - for now we'll handle the error display
    return (
      <div className="w-full my-4">
        <div className="mx-auto w-max max-w-full text-center">
          <div 
            className="p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center"
            style={{ minHeight: '150px', maxWidth: '100%' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 mb-1">Image reference: {src}</p>
            <p className="text-xs text-gray-400">This image is referenced locally and needs to be migrated to Firebase Storage</p>
          </div>
        </div>
      </div>
    );
  }

  // For remote images (including Firebase Storage URLs)
  if (isRemoteUrl) {
    return (
      <div className="w-full my-4">
        <div className="mx-auto w-max max-w-full">
          <NextImage 
            src={imgSrc} 
            alt={alt || ''} 
            width={width || 800}
            height={height || 600}
            className="max-w-full h-auto rounded-lg"
            style={{ 
              opacity: isLoading ? 0.5 : 1,
              transition: "opacity 0.3s ease-in-out",
              display: error ? 'none' : 'block'
            }}
            onLoadingComplete={() => {
              setIsLoading(false);
              setError(false);
            }}
            onError={() => {
              console.error(`Failed to load image: ${imgSrc}`);
              setIsLoading(false);
              setError(true);
            }}
          />
          {isLoading && (
            <div className="flex justify-center items-center py-4">
              <span className="text-gray-400">Loading image...</span>
            </div>
          )}
          {error && (
            <div className="p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-gray-500">Unable to load image</p>
              <p className="text-xs text-gray-400 mt-1">{src}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // For absolute local paths, use Next.js Image with optimization
  return (
    <div className="w-full my-4">
      <div className="mx-auto w-max max-w-full">
        <NextImage 
          src={imgSrc} 
          alt={alt || ""}
          width={dimensions.width}
          height={dimensions.height || dimensions.width}
          className="max-w-full h-auto rounded-lg"
          {...rest}
        />
      </div>
    </div>
  );
};

Image.displayName = "MarkdownImage";

export default Image;
