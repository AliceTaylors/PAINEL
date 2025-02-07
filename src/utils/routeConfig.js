export const API_ROUTES = {
  CHECK: '/api/checks',
  CRYPTO: '/api/crypto/callback',
  PIX: '/api/pix-deposits',
  USER: '/api/user',
  SECCX: '/api/seccx'
};

export const validateRoute = (route) => {
  return route.toLowerCase().replace(/\/+/g, '/');
}; 