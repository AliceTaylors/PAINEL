import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { checkToken } from '../../../utils/auth';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { cpf } = req.body;
    const { token } = req.headers;
    
    // Verificar token e usuário
    const validToken = checkToken(token);
    if (!validToken) {
      return res.send({ error: "Not allowed" });
    }

    const user = await User.findOne({ _id: validToken.user._id });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Custo da consulta
    const cost = 2.00;

    // Verificar saldo
    if (user.balance < cost) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Fazer requisição à API de consulta
    const apiResponse = await axios.get(`https://ws.hubdodesenvolvedor.com.br/v2/cadastropf/?cpf=${cpf}&token=${process.env.HUB_TOKEN}`);

    if (!apiResponse.data.result) {
      return res.status(400).json({ message: 'CPF não encontrado' });
    }

    // Atualizar saldo e logs do usuário
    await User.updateOne(
      { _id: user._id },
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
