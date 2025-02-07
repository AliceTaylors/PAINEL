const nextTranslate = require('next-translate');

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
      'cryptologos.cc',
      'cdn.iconscout.com',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/check/:id',
        destination: '/api/check/[id]'
      },
      {
        source: '/api/user/:id',
        destination: '/api/user/[id]'
      },
      {
        source: '/api/affiliate/stats/:id',
        destination: '/api/affiliate/stats/[id]'
      }
    ];
  }
});
