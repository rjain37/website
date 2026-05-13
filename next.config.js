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

    // Optimize webpack settings and reduce cache size
    webpack: (config, { dev, isServer }) => {
      // Force disable cache in production
      if (!dev) {
        config.cache = false;
      } else {
        // Limit cache size even in development
        if (config.cache) {
          config.cache = {
            type: 'filesystem',
            buildDependencies: {
              config: [__filename]
            },
            cacheDirectory: path.resolve(process.cwd(), '.next/cache/webpack'),
            maxAge: 86400000, // 1 day in milliseconds
            compression: 'gzip',
            profile: false,
            // Evict items when cache gets too large
            maxMemoryGenerations: 1
          };
        }
      }
      
      // Optimize for all builds
      if (!isServer) {
        // Exclude large dependencies from the client bundle
        config.externals = [...(config.externals || []), 'sharp', 'firebase-admin'];
      }
      
      // Enhance optimization settings for better performance and smaller bundles
      if (config.optimization) {
        // Tree shaking is enabled by default in production
        
        // Better code splitting
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            // Create a separate chunk for vendor modules
            vendor: {
              name: 'vendors',
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              chunks: 'initial',
              reuseExistingChunk: true,
            },
            // Create a separate chunk for common code
            common: {
              name: 'commons',
              minChunks: 2,
              priority: -20,
              chunks: 'initial',
              reuseExistingChunk: true,
            },
          },
        };
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