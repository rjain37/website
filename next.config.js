const path = require("path");
const withRemoteRefresh = require("next-remote-refresh")({
  paths: [path.resolve(__dirname, "posts")],
});
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withRemoteRefresh(
  withBundleAnalyzer({
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'api.producthunt.com'
        },
        {
          protocol: 'https',
          hostname: 'lh3.googleusercontent.com'
        }
      ]
    },
    webpack: (config, { dev, isServer }) => {
      // Optimize webpack cache
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename]
        },
        cacheDirectory: path.join(__dirname, '.next/cache'),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        compression: 'gzip'
      };
      return config;
    }
  })
);
