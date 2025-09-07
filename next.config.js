/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  env: {
    WANDB_API_KEY: process.env.WANDB_API_KEY,
    WANDB_PROJECT: process.env.WANDB_PROJECT,
    WANDB_ENTITY: process.env.WANDB_ENTITY,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig