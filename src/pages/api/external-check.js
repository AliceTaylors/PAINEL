import mongoose from 'mongoose';
import axios from 'axios';
import crypto from 'crypto';
import User from '../../models/User';
import { getBinInfo } from '../../utils/binInfo';

// Conexão MongoDB
const dbConnect = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB);
};

// Configurações dos checkers
const CHECKER_CONFIG = {
  adyen: {
    name: 'Adyen Gateway',
    liveCost: 0.50,
    dieCost: 0,
    maxDies: 40,
    apiUrl: process.env.API_1_URL
  },
  premium: {
    name: 'Premium Gateway',
    liveCost: 1.00,
    dieCost: 0.10,
    maxDies: 20,
    apiUrl: process.env.API_2_URL
  }
};

// Helper function to check consecutive dies
function getConsecutiveDies(logs, checkerType) {
  let count = 0;
  for (const log of logs) {
    if (log.history_type === `${checkerType.toUpperCase()} DIE`) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

// Helper function to check if user is blocked
function isUserBlocked(user, checkerType) {
  const blockKey = `${checkerType}_block_until`;
  if (user[blockKey]) {
    const blockUntil = new Date(user[blockKey]);
    if (blockUntil > new Date()) {
      return true;
    }
  }
  return false;
}

export default async function handler(req, res) {
  try {
    await dbConnect();
    
    const { user: username, password, checker, lista } = req.query;

    // Validar parâmetros
    if (!username || !password || !checker || !lista) {
      return res.json({
        status: "error",
        msg: "Missing required parameters"
      });
    }

    // Validar tipo de checker
    if (!['adyen', 'premium'].includes(checker)) {
      return res.json({
        status: "error",
        msg: "Invalid checker type. Use 'adyen' or 'premium'"
      });
    }

    // Buscar usuário
    const dbUser = await User.findOne({ username, password });
    if (!dbUser) {
      return res.json({
        status: "error",
        msg: "Invalid credentials"
      });
    }

    const config = CHECKER_CONFIG[checker];

    // Verificar saldo mínimo
    if (dbUser.balance < config.liveCost) {
      return res.json({
        status: "error",
        msg: `Insufficient funds. Minimum balance required: $${config.liveCost}`,
        balance: dbUser.balance.toFixed(2)
      });
    }

    // Extrair e validar dados do cartão
    const [cc, month, year, cvv] = lista.split('|');
    if (!cc || !month || !year || !cvv) {
      return res.json({
        status: "error",
        msg: "Invalid card format. Use: CC|MM|YY|CVV"
      });
    }

    // Obter informações do BIN
    const bin = cc.slice(0, 6);
    const binInfo = await getBinInfo(bin);

    // Fazer requisição ao checker
    const checkResult = await axios.get(`${config.apiUrl}${lista}`);
    
    // Processar resposta do checker
    if (checkResult.data.error) {
      return res.json({
        status: "error",
        msg: checkResult.data.retorno || "Check error",
        balance: dbUser.balance.toFixed(2)
      });
    }

    if (checkResult.data.success) {
      // Cartão aprovado
      await dbUser.updateOne({
        logs: [{
          history_type: `${checker.toUpperCase()} LIVE`,
          cost: -config.liveCost,
          data: lista,
          date: new Date()
        }, ...dbUser.logs],
        $inc: { balance: -config.liveCost }
      });

      return res.json({
        status: "live",
        msg: "#LIVE - Pagamento Aprovado",
        balance: (dbUser.balance - config.liveCost).toFixed(2),
        details: {
          number: cc,
          month,
          year,
          cvv,
          bin: binInfo,
          checker: checker.toUpperCase(),
          time: new Date().toISOString()
        }
      });
    } else {
      // Cartão recusado
      await dbUser.updateOne({
        logs: [{
          history_type: `${checker.toUpperCase()} DIE`,
          cost: -config.dieCost,
          data: lista,
          date: new Date()
        }, ...dbUser.logs],
        $inc: { balance: -config.dieCost }
      });

      return res.json({
        status: "die",
        msg: "#DIE - Cartão Recusado",
        balance: (dbUser.balance - config.dieCost).toFixed(2),
        details: {
          number: cc,
          month,
          year,
          cvv,
          bin: binInfo,
          checker: checker.toUpperCase(),
          time: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return res.json({
      status: "error",
      msg: "Internal server error",
      error: error.message
    });
  }
} 
