// next.config.mjs
export default {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false
    }
    return config
  }
}
