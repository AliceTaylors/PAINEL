import mongoose from 'mongoose';
import axios from 'axios';
import crypto from 'crypto';

// Conexão MongoDB
const dbConnect = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB);
};

// Modelo User
const userSchema = new mongoose.Schema({
  login: String,
  password: String,
  balance: Number,
  logs: Array,
  mail: String,
  ipAddress: String,
  order: {
    amount: Number,
    complete: Boolean,
    currency: String,
    address: String,
    pricing: String,
    externalId: String,
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

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
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    await dbConnect();

    const { user, password, checker, lista } = req.query;

    if (!user || !password || !checker || !lista) {
      return res.json({
        status: "error",
        msg: "Missing parameters"
      });
    }

    // Authenticate user
    const dbUser = await User.findOne({ login: user, password });
    if (!dbUser) {
      return res.json({
        status: "error", 
        msg: "Invalid credentials"
      });
    }

    // Check if user is blocked
    if (isUserBlocked(dbUser, checker)) {
      return res.json({
        status: "error",
        msg: `You are blocked from using ${checker} checker for 24 hours due to too many consecutive dies`
      });
    }

    // Configurações específicas do checker
    const config = {
      premium: {
        apiUrl: process.env.API_2_URL,
        liveCost: -1.0,
        dieCost: -0.1,
        minBalance: 1.0,
        maxDies: 20
      },
      adyen: {
        apiUrl: process.env.API_1_URL,
        liveCost: -0.5,
        dieCost: 0,
        minBalance: 0.5,
        maxDies: 40
      }
    }[checker];

    if (!config) {
      return res.json({
        status: "error",
        msg: "Invalid checker type"
      });
    }

    // Check minimum balance
    if (dbUser.balance < Math.abs(config.minBalance)) {
      return res.json({
        status: "error",
        msg: `Insufficient funds. Minimum balance required: $${config.minBalance}`
      });
    }

    // Make API request
    const API_RESULT = await axios.get(config.apiUrl + lista);

    // Handle error responses
    if (API_RESULT.data.error) {
      return res.json({
        status: "error",
        msg: API_RESULT.data.retorno
      });
    }

    // Handle die responses
    if (!API_RESULT.data.success) {
      const consecutiveDies = getConsecutiveDies(dbUser.logs, checker);
      
      if (consecutiveDies >= config.maxDies) {
        const blockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await dbUser.updateOne({
          [`${checker}_block_until`]: blockUntil
        });
        return res.json({
          status: "error",
          msg: `Too many consecutive dies. You are blocked from using ${checker} checker for 24 hours.`
        });
      }

      await dbUser.updateOne({
        logs: [
          {
            history_type: `${checker.toUpperCase()} DIE`,
            cost: config.dieCost,
            data: lista,
          },
          ...dbUser.logs,
        ],
        $inc: { balance: config.dieCost }
      });

      return res.json({
        status: "die",
        msg: API_RESULT.data.retorno,
        balance: (dbUser.balance + config.dieCost).toFixed(2)
      });
    }

    // Handle live responses
    if (API_RESULT.data.success) {
      await dbUser.updateOne({
        logs: [
          {
            history_type: `${checker.toUpperCase()} LIVE`,
            cost: config.liveCost,
            data: lista,
          },
          ...dbUser.logs,
        ],
        $inc: { balance: config.liveCost },
        $unset: { [`${checker}_block_until`]: "" }
      });

      return res.json({
        status: "live",
        msg: API_RESULT.data.retorno,
        balance: (dbUser.balance + config.liveCost).toFixed(2)
      });
    }

  } catch (error) {
    console.error(error);
    return res.json({
      status: "error",
      msg: "Internal server error"
    });
  }
} 
