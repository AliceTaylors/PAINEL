import dbConnect from '../utils/dbConnect';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { cpf } = req.body;
    const { token } = req.headers;
    
    // Validar CPF
    if (!cpf || !cpf.match(/^\d{11}$/)) {
      return res.status(400).json({ 
        message: 'CPF inválido. Digite apenas números (11 dígitos)' 
      });
    }

    // Verificar token e usuário
    if (!token) {
      return res.status(401).json({ message: 'Not allowed' });
    }

    // Buscar usuário
    const db = global.mongoose.connection.db;
    const dbUser = await db.collection('users').findOne({ 
      'sessions.token': token 
    });

    if (!dbUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Custo da consulta
    const cost = 2.00;

    // Verificar saldo
    if (dbUser.balance < cost) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Verificar se a chave da API está configurada
    if (!process.env.HUB_TOKEN) {
      console.error('HUB_TOKEN não configurado');
      return res.status(500).json({ 
        message: 'Erro de configuração do servidor'
      });
    }

    try {
      // Fazer requisição à API de consulta
      const apiUrl = `https://ws.hubdodesenvolvedor.com.br/v2/cpf/?cpf=${cpf}&token=${process.env.HUB_TOKEN}`;
      const apiResponse = await axios.get(apiUrl, {
        timeout: 30000, // 30 segundos timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // Verificar se a resposta é válida
      if (!apiResponse.data || apiResponse.data.error) {
        console.error('API Response:', apiResponse.data);
        return res.status(400).json({ 
          message: apiResponse.data?.message || 'CPF não encontrado na base de dados'
        });
      }

      // Atualizar saldo e logs do usuário
      await db.collection('users').updateOne(
        { _id: dbUser._id },
        {
          $push: {
            logs: {
              $each: [{
                history_type: 'CONSULTA CPF',
                cost: -cost,
                data: `CPF: ${cpf}`,
                date: new Date()
              }],
              $position: 0
            }
          },
          $inc: { balance: -cost }
        }
      );

      // Retornar dados da consulta
      return res.status(200).json({
        success: true,
        result: apiResponse.data,
        balance: dbUser.balance - cost
      });

    } catch (apiError) {
      console.error('API externa error:', apiError.response?.data || apiError.message);
      return res.status(503).json({ 
        message: 'Serviço de consulta temporariamente indisponível',
        error: apiError.response?.data?.message || apiError.message
      });
    }

  } catch (error) {
    console.error('Consulta CPF error:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor. Tente novamente mais tarde.',
      error: error.message
    });
  }
} 
