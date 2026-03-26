/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure that the build can resolve the aliases if we decide to keep them
  // but for now we are using relative paths in page.tsx as a fail-safe
};

module.exports = nextConfig;
