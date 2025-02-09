import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cc, checker } = req.body;
    
    if (!cc || !checker) {
      return res.status(400).json({
        status: "error",
        message: 'Missing required parameters'
      });
    }

    // Selecionar URL baseado no tipo de checker
    const API_URL = checker === 'adyen' ? process.env.API_1_URL : process.env.API_2_URL;
    
    if (!API_URL) {
      return res.status(500).json({
        status: "error",
        message: 'Checker configuration error'
      });
    }

    try {
      // Fazer requisição ao checker
      const checkResult = await axios.get(`${API_URL}/${cc}`, {
        timeout: 30000,
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Aceitar respostas entre 200-499
        }
      });

      // Processar resposta baseado no tipo de checker
      if (checker === 'adyen') {
        // Adyen retorna {"live":true} ou {"live":false}
        if (checkResult.data && typeof checkResult.data.live === 'boolean') {
          return res.json({
            status: checkResult.data.live ? "live" : "die",
            message: checkResult.data.live ? "Approved" : "Declined"
          });
        } else {
          throw new Error('Invalid Adyen response format');
        }
      } else {
        // Premium checker
        if (checkResult.data.error) {
          return res.json({
            status: "error",
            message: checkResult.data.retorno.replace(/\s*\[\d+\]$/, '')
          });
        }
        
        const isLive = checkResult.data.success && 
          checkResult.data.retorno.includes("Pagamento Aprovado");

        return res.json({
          status: isLive ? "live" : "die",
          message: checkResult.data.retorno.replace(/\s*\[\d+\]$/, '')
        });
      }
    } catch (apiError) {
      console.error('API request error:', apiError);
      return res.status(500).json({
        status: "error",
        message: 'Gateway temporarily unavailable'
      });
    }

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      status: "error",
      message: 'Internal server error'
    });
  }
} 
