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
        source: '/seccx.php',
        destination: '/api/seccx'
      },
      {
        source: '/api/checker/:path*',
        destination: '/api/checker/:path*'
      },
      {
        source: '/api/checks/:path*',
        destination: '/api/checks/:path*'
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, token' },
        ],
      },
    ];
  }
});
