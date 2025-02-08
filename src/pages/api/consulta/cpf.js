import { connectToDatabase } from '../../../utils/mongodb';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();

    const { cpf } = req.body;
    const { token } = req.headers;
    
    // Verificar token e usuário
    if (!token) {
      return res.send({ error: "Not allowed" });
    }

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

    // Fazer requisição à API de consulta
    const apiResponse = await axios.get(`https://ws.hubdodesenvolvedor.com.br/v2/cadastropf/?cpf=${cpf}&token=${process.env.HUB_TOKEN}`);

    if (!apiResponse.data.result) {
      return res.status(400).json({ message: 'CPF não encontrado' });
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

    return res.json(apiResponse.data);

  } catch (error) {
    console.error('Consulta CPF error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 
