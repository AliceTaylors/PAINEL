// Configurações dos checkers
const CHECKER_CONFIG = {
  adyen: {
    name: 'Adyen Gateway',
    description: 'For Fullz & Gens',
    liveCost: 0.50,
    dieCost: 0,
    maxDies: 40,
    apiUrl: process.env.API_1_URL,
    features: [
      'Fullz Support',
      'Gen Support',
      'Fast Check',
      'High Approval Rate',
      'No Die Cost'
    ]
  },
  premium: {
    name: 'Premium Gateway',
    description: 'Charged Cards',
    liveCost: 1.00,
    dieCost: 0.10,
    maxDies: 20,
    apiUrl: process.env.API_2_URL,
    features: [
      'Charged Cards',
      'AVS Check',
      'CVV Check',
      'ZIP Check',
      'Premium Support'
    ]
  }
};

// Função para obter configuração do checker
const getCheckerConfig = (type) => {
  return CHECKER_CONFIG[type] || null;
};

// Função para calcular custo
const calculateCost = (type, isLive) => {
  const config = getCheckerConfig(type);
  if (!config) return 0;
  return isLive ? config.liveCost : config.dieCost;
};

// Função para verificar limite de dies
const checkDiesLimit = (type, consecutiveDies) => {
  const config = getCheckerConfig(type);
  if (!config) return true;
  return consecutiveDies >= config.maxDies;
};

// Função para obter URL da API
const getApiUrl = (type) => {
  const config = getCheckerConfig(type);
  return config?.apiUrl || null;
};

// Exportar funções e configurações
module.exports = {
  CHECKER_CONFIG,
  getCheckerConfig,
  calculateCost,
  checkDiesLimit,
  getApiUrl
};
