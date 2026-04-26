/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['pdfjs-dist'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'canvas': false,
    };
    return config;
  },
};

module.exports = nextConfig;
