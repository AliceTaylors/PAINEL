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
        headers: {
          'Accept': 'text/plain',
          'Content-Type': 'text/plain'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      });

      // Processar resposta baseado no tipo de checker
      if (checker === 'adyen') {
        try {
          // Verificar se temos uma resposta válida
          if (!checkResult.data) {
            throw new Error('Empty response from Adyen');
          }

          // Log para debug
          console.log('Raw Adyen response:', checkResult.data);

          // A resposta do Adyen vem como string
          const responseText = checkResult.data;

          // Verificar se é uma resposta válida
          if (typeof responseText !== 'string') {
            throw new Error('Invalid response format');
          }

          // Processar a resposta
          if (responseText === "Live") {
            return res.json({
              status: "live",
              message: "Approved"
            });
          } else if (responseText === "Die") {
            return res.json({
              status: "die",
              message: "Declined"
            });
          } else {
            throw new Error('Unexpected response: ' + responseText);
          }

        } catch (adyenError) {
          console.error('Adyen processing error:', adyenError);
          return res.status(500).json({
            status: "error",
            message: adyenError.message || "Gateway Error"
          });
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
