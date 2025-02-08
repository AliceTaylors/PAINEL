const nextTranslate = require('next-translate-plugin');

module.exports = nextTranslate({
  reactStrictMode: true,
  swcMinify: false,
  images: {
    domains: [
      'www.bitcoinqrcodemaker.com',
      'chart.googleapis.com',
      'cdn-icons-png.flaticon.com',
      'cdn0.iconfinder.com',
      'coinicons-api.vercel.app',
      'acceptable.a-ads.com',
      'qrickit.com',
    ],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.modules.push(__dirname + '/src')
    return config
  }
});
