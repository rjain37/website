const path = require("path");
const withRemoteRefresh = require("next-remote-refresh")({
  paths: [path.resolve(__dirname, "posts")],
});
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withRemoteRefresh(
  withBundleAnalyzer({
    // Fix for the route mismatch error
    trailingSlash: true,
    
    // Use standalone output format for smaller builds
    output: 'standalone',
    
    // Reduce webpack cache size
    webpack: (config, { dev, isServer }) => {
      // Only keep webpack cache in development
      if (!dev) {
        config.cache = false;
      }
      
      // Optimize for production builds
      if (!dev && !isServer) {
        // Exclude large dependencies from the client bundle
        config.externals = [...(config.externals || []), 'sharp'];
        
        // Add additional optimizations
        if (config.optimization) {
          // Improve tree shaking
          config.optimization.usedExports = true;
        }
      }
      
      return config;
    },
    
    // Optimize image loading
    images: {
      // Use remotePatterns instead of domains (more secure)
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'api.producthunt.com',
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com',
        },
      ],
      // Reduce image cache size
      minimumCacheTTL: 60,
    },
    
    // Exclude debug files from production
    excludeDefaultMomentLocales: true,
    
    // Reduce serverless function size
    experimental: {
      // Optimize serverless functions
      optimizeServerReact: true,
    },
  })
);