import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cc, checker } = req.body;

    // Selecionar URL baseado no tipo de checker
    const API_URL = checker === 'adyen' ? process.env.API_1_URL : process.env.API_2_URL;

    // Fazer requisição ao checker
    const checkResult = await axios.get(`${API_URL}/${cc}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Retornar resultado
    res.json(checkResult.data);

  } catch (error) {
    console.error('Check error:', error);
    res.status(500).json({ 
      error: true, 
      retorno: error.response?.data?.message || 'API Connection Error' 
    });
  }
} 
