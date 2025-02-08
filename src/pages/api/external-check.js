import mongoose from 'mongoose';
import axios from 'axios';
import crypto from 'crypto';
import User from '../../models/User';

// Conexão MongoDB
const dbConnect = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB);
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

    // Verificar bloqueio
    if (isUserBlocked(dbUser, checker)) {
      return res.json({
        status: "error",
        msg: `You are blocked from using ${checker} checker. Try again later.`,
        balance: dbUser.balance.toFixed(2)
      });
    }

    // Verificar saldo mínimo
    const minBalance = checker === 'adyen' ? 0.50 : 1.00;
    if (dbUser.balance < minBalance) {
      return res.json({
        status: "error",
        msg: `Insufficient funds. Minimum balance required: $${minBalance}`,
        balance: dbUser.balance.toFixed(2)
      });
    }

    // Extrair dados do cartão
    const [cc, month, year, cvv] = lista.split('|');
    if (!cc || !month || !year || !cvv) {
      return res.json({
        status: "error",
        msg: "Invalid card format. Use: CC|MM|YY|CVV"
      });
    }

    // Fazer requisição ao checker
    const API_URL = checker === 'adyen' ? process.env.API_1_URL : process.env.API_2_URL;
    const checkResult = await axios.get(`${API_URL}${lista}`);
    
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
      const cost = checker === 'adyen' ? -0.50 : -1.00;
      await dbUser.updateOne({
        logs: [{
          history_type: `${checker.toUpperCase()} LIVE`,
          cost: cost,
          data: lista,
          date: new Date()
        }, ...dbUser.logs],
        $inc: { balance: cost }
      });

      return res.json({
        status: "live",
        msg: "#LIVE - Pagamento Aprovado",
        balance: (dbUser.balance + cost).toFixed(2),
        details: {
          number: cc,
          month,
          year,
          cvv,
          checker: checker.toUpperCase(),
          time: new Date().toISOString()
        }
      });
    } else {
      // Cartão recusado
      const dieCost = checker === 'premium' ? -0.10 : 0;
      const consecutiveDies = getConsecutiveDies(dbUser.logs, checker);
      
      if (consecutiveDies >= (checker === 'adyen' ? 40 : 20)) {
        const blockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await dbUser.updateOne({
          [`${checker}_block_until`]: blockUntil
        });
        return res.json({
          status: "error",
          msg: `Too many consecutive dies. You are blocked from using ${checker} checker for 24 hours.`,
          balance: dbUser.balance.toFixed(2)
        });
      }

      await dbUser.updateOne({
        logs: [{
          history_type: `${checker.toUpperCase()} DIE`,
          cost: dieCost,
          data: lista,
          date: new Date()
        }, ...dbUser.logs],
        $inc: { balance: dieCost }
      });

      return res.json({
        status: "die",
        msg: "#DIE - Cartão Recusado",
        balance: (dbUser.balance + dieCost).toFixed(2),
        details: {
          number: cc,
          month,
          year,
          cvv,
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
