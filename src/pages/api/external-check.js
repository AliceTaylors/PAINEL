import dbConnect from '../utils/dbConnect';
import User from '../models/User';
import axios from 'axios';
import crypto from 'crypto';

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

  try {
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

    // Check minimum balance based on checker type
    const minBalance = checker === 'premium' ? 0.1 : 0.5;
    if (dbUser.balance < minBalance) {
      return res.json({
        status: "error",
        msg: "Insufficient funds"
      });
    }

    let API_URL;
    let liveCost;
    let dieCost;
    let maxConsecutiveDies;

    // Set API URL and costs based on checker type
    if (checker === 'premium') {
      API_URL = process.env.API_2_URL;
      liveCost = -1.0;
      dieCost = -0.1;
      maxConsecutiveDies = 20;
    } else if (checker === 'adyen') {
      API_URL = process.env.API_1_URL;
      liveCost = -0.2;
      dieCost = 0;
      maxConsecutiveDies = 40;
    } else {
      return res.json({
        status: "error",
        msg: "Invalid checker type"
      });
    }

    // Call checker API
    const API_RESULT = await axios.get(API_URL + lista);

    if (API_RESULT.data.error) {
      // Handle die result
      const consecutiveDies = getConsecutiveDies(dbUser.logs, checker) + 1;
      
      // Check if user should be blocked
      if (consecutiveDies >= maxConsecutiveDies) {
        const blockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        await dbUser.updateOne({
          logs: [
            {
              history_type: `${checker.toUpperCase()} DIE`,
              cost: dieCost,
              data: lista,
            },
            ...dbUser.logs,
          ],
          $inc: {
            balance: dieCost,
          },
          [`${checker}_block_until`]: blockUntil
        });

        return res.json({
          status: "error",
          msg: `Account blocked from ${checker} checker for 24 hours due to ${maxConsecutiveDies} consecutive dies`,
          balance: (dbUser.balance + dieCost).toFixed(2)
        });
      }

      await dbUser.updateOne({
        logs: [
          {
            history_type: `${checker.toUpperCase()} DIE`,
            cost: dieCost,
            data: lista,
          },
          ...dbUser.logs,
        ],
        $inc: {
          balance: dieCost,
        },
      });

      return res.json({
        status: "die",
        msg: API_RESULT.data.retorno,
        balance: (dbUser.balance + dieCost).toFixed(2)
      });
    }

    if (API_RESULT.data.success) {
      // Check balance for live cost
      if (dbUser.balance < Math.abs(liveCost)) {
        return res.json({
          status: "error",
          msg: "Insufficient funds for live check"
        });
      }

      // Handle live result
      await dbUser.updateOne({
        logs: [
          {
            history_type: `${checker.toUpperCase()} LIVE`,
            cost: liveCost,
            data: lista,
          },
          ...dbUser.logs,
        ],
        $inc: {
          balance: liveCost,
        },
        // Reset block if it exists
        $unset: {
          [`${checker}_block_until`]: ""
        }
      });

      return res.json({
        status: "live",
        msg: API_RESULT.data.retorno,
        balance: (dbUser.balance + liveCost).toFixed(2)
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
