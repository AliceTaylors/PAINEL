import axios from 'axios';
import jwt from 'jsonwebtoken';
import dbConnect from './utils/dbConnect';
import User from './models/User';

export default async function handler(req, res) {
  await dbConnect();

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, token'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { usuario, senha, checker = 'adyen', lista } = req.query;

    // Validate parameters
    if (!usuario || !senha || !lista) {
      return res.json({
        status: "error",
        msg: "Missing parameters"
      });
    }

    // Validate user credentials from database
    const user = await User.findOne({ 
      login: usuario,
      password: senha 
    });

    if (!user) {
      return res.json({
        status: "error",
        msg: "Invalid credentials"
      });
    }

    // Check user balance
    const checkCost = checker === 'premium' ? 1.0 : 0.5;
    if (user.balance < checkCost) {
      return res.json({
        status: "error",
        msg: "Insufficient balance"
      });
    }

    // Generate token for internal API
    const token = jwt.sign({ user: { _id: user._id } }, "CHAVEZAOPRIVADO");

    // Get base URL
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const baseUrl = `${protocol}://${req.headers.host}`;

    // Make request to checker API
    const check = await axios.post(`${baseUrl}/api/checks`, 
      { 
        cc: lista,
        checker
      },
      { 
        headers: { 
          token,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Host': req.headers.host
        }
      }
    );

    // Update user balance and logs
    await user.updateOne({
      logs: [
        {
          history_type: "CHECK CARD",
          data: `${lista} - ${check.data.success ? 'Approved' : 'Declined'}`,
          cost: -checkCost
        },
        ...user.logs
      ],
      $inc: { balance: -checkCost }
    });

    // Format response
    if (check.data.success) {
      return res.json({
        status: "approved",
        msg: "Card Approved ✅",
        card: lista,
        bin: check.data.bin || "",
        bank: check.data.bank || "",
        type: check.data.type || "",
        level: check.data.level || "",
        country: check.data.country || "",
        flag: check.data.flag || ""
      });
    } else {
      return res.json({
        status: "declined",
        msg: "Card Declined ❌",
        card: lista
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return res.json({
      status: "error",
      msg: error.message || "Internal server error",
      error: error.response?.data || error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true
  },
}; 
