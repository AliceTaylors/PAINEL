export const API_ROUTES = {
  CHECK: '/api/check',
  CRYPTO_CALLBACK: '/api/crypto/callback',
  PIX: '/api/pix-deposits',
  SECCX: '/api/seccx'
};

export const validateRoute = (route) => {
  return route.toLowerCase().replace(/\/+/g, '/');
}; 