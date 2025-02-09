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
    const checkResult = await axios.get(`${API_URL}/${cc}`);

    // Processar resposta baseado no tipo de checker
    if (checker === 'adyen') {
      // Adyen retorna {"live":true} ou {"live":false}
      const isLive = checkResult.data.live === true;
      return res.json({
        status: isLive ? "live" : "die",
        message: isLive ? "Approved" : "Declined",
        data: checkResult.data
      });
    } else {
      // Premium retorna {"success": true/false, "retorno": "mensagem"}
      if (checkResult.data.error) {
        return res.json({
          status: "error",
          message: checkResult.data.retorno.replace(/\s*\[\d+\]$/, '')
        });
      }
      
      // Verificar se é um live específico do Premium
      const isLive = checkResult.data.success && 
        (checkResult.data.retorno.includes("Pagamento Aprovado"));

      // Limpar a mensagem de retorno removendo códigos numéricos
      const cleanMessage = checkResult.data.retorno.replace(/\s*\[\d+\]$/, '');

      return res.json({
        status: isLive ? "live" : "die",
        message: cleanMessage,
        data: checkResult.data
      });
    }

  } catch (error) {
    console.error('Check error:', error);
    return res.status(500).json({ 
      status: "error",
      message: error.response?.data?.message || 'API Connection Error'
    });
  }
} 
