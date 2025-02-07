import mongoose from 'mongoose';
import axios from 'axios';
import crypto from 'crypto';

// Conexão MongoDB
const dbConnect = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(process.env.MONGODB_URI);
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

    // Check if user is blocked for this checker
    if (isUserBlocked(dbUser, checker)) {
      return res.json({
        status: "error",
        msg: `You are blocked from using ${checker} checker for 24 hours due to too many consecutive dies`
      });
    }

    // Format card data
    const [cc, month, year, cvv] = lista.split('|');
    if (!cc || !month || !year || !cvv) {
      return res.json({
        status: "error",
        msg: "Invalid card format. Use: CC|MM|YYYY|CVV"
      });
    }

    // Configurações específicas do checker
    const checkerConfig = {
      premium: {
        apiUrl: process.env.API_2_URL,
        liveCost: -1.0,
        dieCost: -0.1,
        minBalance: 0.1,
        maxDies: 20
      },
      adyen: {
        apiUrl: process.env.API_1_URL,
        liveCost: -0.2,
        dieCost: 0,
        minBalance: 0.5,
        maxDies: 40
      }
    };

    const config = checkerConfig[checker];
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
        msg: "Insufficient funds"
      });
    }

    // Make API request
    const API_RESULT = await axios.get(config.apiUrl + lista);

    // Handle API error
    if (API_RESULT.data.error) {
      const consecutiveDies = getConsecutiveDies(dbUser.logs, checker);
      
      // Check if user should be blocked
      if (consecutiveDies >= config.maxDies) {
        const blockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        await dbUser.updateOne({
          logs: [
            {
              history_type: `${checker.toUpperCase()} DIE`,
              cost: config.dieCost,
              data: lista,
            },
            ...dbUser.logs,
          ],
          $inc: { balance: config.dieCost },
          [`${checker}_block_until`]: blockUntil
        });

        return res.json({
          status: "error",
          msg: `Account blocked from ${checker} checker for 24 hours due to ${config.maxDies} consecutive dies`,
          balance: (dbUser.balance + config.dieCost).toFixed(2)
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

    // Handle successful check
    if (API_RESULT.data.success) {
      if (dbUser.balance < Math.abs(config.liveCost)) {
        return res.json({
          status: "error",
          msg: "Insufficient funds for live check"
        });
      }

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
