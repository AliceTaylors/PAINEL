import axios from 'axios';
import jwt from 'jsonwebtoken';

// Função simplificada para verificar token
const checkToken = (token) => {
  if (!token) return false;
  try {
    return jwt.verify(token, "CHAVEZAOPRIVADO");
  } catch {
    return false;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, cc } = req.query;
    
    // Remove o "cc:" do início do cartão
    const cardData = cc.replace('cc:', '');
    
    // Validar o token
    const validToken = checkToken(token);
    if (!validToken) {
      return res.status(401).json({ 
        success: false,
        return: "#ERROR",
        message: "Invalid token" 
      });
    }

    // Fazer a requisição para o checker
    const check = await axios.post('/api/checks',
      { 
        cc: cardData,
        checker: 'premium' 
      },
      { 
        headers: { 
          token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    // Formatar resposta no padrão solicitado
    if (check.data.success) {
      return res.json({
        success: true,
        retorno: "Pagamento Aprovado! [00]",
        card: cardData,
        bin: check.data.bin || "",
        bank: check.data.bank || "",
        type: check.data.type || "",
        level: check.data.level || "",
        country: check.data.country || ""
      });
    } 
    
    if (check.data.error) {
      // Verificar tipo de erro
      if (check.data.message?.includes('invalid')) {
        return res.json({
          error: true,
          retorno: "Cartão Invalido!"
        });
      }
      if (check.data.message?.includes('expired')) {
        return res.json({
          error: true,
          retorno: "Cartão Expirado!"
        });
      }
      return res.json({
        error: true,
        retorno: "Cartão Não Suportado!"
      });
    }

    // Cartão recusado
    return res.json({
      success: false,
      retorno: "Sua Transação Foi Negada! [999]",
      card: cardData
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: true,
      retorno: error.message || "Erro Interno!"
    });
  }
} 
