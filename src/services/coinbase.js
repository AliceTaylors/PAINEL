import axios from 'axios';
import crypto from 'node:crypto';

import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.COINBASE;
const API_VERSION = '2018-03-22';
const API_BASE_URL = 'https://api.commerce.coinbase.com';

// Função para verificar o status de uma transação pelo ID
export async function checkTransactionStatus(transactionId) {
  try {
    const response = await axios.get(
      `https://api.commerce.coinbase.com/charges/${transactionId}`,
      {
        headers: {
          'X-CC-Api-Key': API_KEY,
          'Content-Type': 'application/json',
          'X-CC-Version': API_VERSION,
        },
      }
    );

    const transaction = response.data;
    const status =
      transaction.data.timeline[transaction.data.timeline.length - 1].status;

    if (status == 'NEW') {
      return 'WAITING';
    }
    return status;
  } catch (error) {
    console.error('Erro ao verificar o status da transação:', error);
    throw error;
  }
}

// Função para criar uma nova cobrança
export async function createCharge({ username, amount, userId }) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/charges`,
      {
        name: `Recarga para ${username}`,
        description: 'Recarga em checkercc.tech',
        local_price: {
          amount: amount,
          currency: 'USD',
        },
        pricing_type: 'fixed_price',
        metadata: {
          customer_id: userId,
          order_id: crypto.randomUUID(),
        },
      },
      {
        headers: {
          'X-CC-Api-Key': API_KEY,
          'X-CC-Version': API_VERSION,
        },
      }
    );

    console.log(
      `Uma cobrança foi criada para ${username} no valor de USD ${amount}!`
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao criar a cobrança: ', error.response.data);
  }
}
