/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Evita erro de 'fs'/'path' no browser
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
      };
    }

    // Permite importar .sql como string (Opção C que você escolheu)
    config.module.rules.push({
      test: /\.sql$/i,
      type: 'asset/source',
    });

    return config;
  },
};

export default nextConfig;
