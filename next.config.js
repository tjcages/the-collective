/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ["jsx", "js", "tsx", "ts", "frag"],
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.frag/,
      type: "asset/source",
    });
    config.module.rules.push({
      test: /\.vert/,
      type: "asset/source",
    });
    return config;
  },
  images: {
    domains: ["s3-us-west-2.amazonaws.com"],
  },
};

module.exports = nextConfig;
