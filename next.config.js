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
  })
);
