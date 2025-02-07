export const API_ROUTES = {
  CHECK: '/api/check',
  USER: '/api/user',
  AFFILIATE_STATS: '/api/affiliate/stats',
  CRYPTO_CALLBACK: '/api/crypto/callback',
  PIX: '/api/pix-deposits'
};

export const validateRoute = (route) => {
  return route.toLowerCase().replace(/\/+/g, '/');
}; 