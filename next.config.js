/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Serve the Cube Cabinet page at the root. The previous React page stays in the repo, untouched.
  async rewrites() {
    return { beforeFiles: [{ source: '/', destination: '/cabinet.html' }] }
  },
}

module.exports = nextConfig
