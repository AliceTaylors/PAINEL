export const API_ROUTES = {
  CHECK: '/api/check',
  USER: '/api/user',
  AFFILIATE: '/api/affiliate/stats',
  CRYPTO: '/api/crypto',
  PIX: '/api/pix-deposits'
};

export const validateRoute = (route) => {
  return route.toLowerCase().replace(/\/+/g, '/');
}; 
