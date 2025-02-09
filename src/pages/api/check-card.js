import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cc, checker } = req.body;
    
    // Verificar parâmetros obrigatórios
    if (!cc || !checker) {
      return res.status(400).json({
        error: true,
        retorno: 'Missing required parameters'
      });
    }

    // Selecionar URL baseado no tipo de checker
    const API_URL = checker === 'adyen' ? process.env.API_1_URL : process.env.API_2_URL;
    
    if (!API_URL) {
      return res.status(500).json({
        error: true,
        retorno: 'Checker configuration error'
      });
    }

    // Fazer requisição ao checker
    const checkResult = await axios.get(`${API_URL}/${cc}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Processar resposta baseado no tipo de checker
    if (checker === 'adyen') {
      return res.json({
        live: checkResult.data.live,
        error: !checkResult.data.live,
        retorno: checkResult.data.live ? 'Approved' : 'Declined'
      });
    } else {
      // Premium checker
      return res.json(checkResult.data);
    }

  } catch (error) {
    console.error('Check error:', error);
    return res.status(500).json({ 
      error: true, 
      retorno: error.response?.data?.message || 'API Connection Error' 
    });
  }
} 
