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

    const API_URL = checker === 'adyen' ? process.env.API_1_URL : process.env.API_2_URL;
    
    if (!API_URL) {
      return res.status(500).json({
        status: "error",
        message: 'Checker configuration error'
      });
    }

    try {
      const checkResult = await axios.get(`${API_URL}/${cc}`);

      if (checker === 'adyen') {
        // Processar resposta do Adyen
        const response = checkResult.data;
        
        // Verificar se a resposta contém a string "Live" ou "Die"
        if (typeof response === 'string' && response.includes('Live')) {
          return res.json({
            status: "live",
            message: "Approved"
          });
        } else if (typeof response === 'string' && response.includes('Die')) {
          return res.json({
            status: "die",
            message: "Declined"
          });
        } else if (response && response.live === true) {
          // Verificar também o formato {"live":true}
          return res.json({
            status: "live",
            message: "Approved"
          });
        } else if (response && response.live === false) {
          // Verificar também o formato {"live":false}
          return res.json({
            status: "die",
            message: "Declined"
          });
        } else {
          return res.json({
            status: "error",
            message: "Gateway Error"
          });
        }
      } else {
        // Premium checker
        if (checkResult.data.error) {
          return res.json({
            status: "error",
            message: checkResult.data.retorno
          });
        }
        
        const isLive = checkResult.data.success && 
          checkResult.data.retorno.includes("Pagamento Aprovado");

        return res.json({
          status: isLive ? "live" : "die",
          message: checkResult.data.retorno
        });
      }

    } catch (error) {
      console.error('API request error:', error);
      return res.status(500).json({
        status: "error",
        message: 'Gateway Error'
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
