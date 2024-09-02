/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  reactStrictMode: false,
}

module.exports = nextConfig
