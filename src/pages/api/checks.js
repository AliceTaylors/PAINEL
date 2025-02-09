import dbConnect from "./utils/dbConnect";
import User from "./models/User";
import crypto from "crypto";
import luhn from "fast-luhn";
import { checkToken } from "./utils/session";
import checkerSettings from "../../checkerSettings";
import Log from "./models/Log";
import { JSDOM } from "jsdom";
const axios = require("axios").default;
import dotenv from "dotenv";
import Check from "./models/Check";

dotenv.config();

const dateInPast = function (firstDate, secondDate) {
  if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0)) {
    return true;
  }

  return false;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { cc, gateway_server } = req.body;
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ message: 'Not allowed' });
    }

    const db = global.mongoose.connection.db;
    const dbUser = await db.collection('users').findOne({ 
      'sessions.token': token 
    });

    if (!dbUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (dbUser.balance < checkerSettings.checkLiveCost) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Fazer o check do cartão aqui
    const checkResult = await processCardCheck(cc, gateway_server);

    // Atualizar saldo e logs
    await updateUserAfterCheck(db, dbUser, cc, checkResult);

    return res.json({
      success: checkResult.success,
      return: checkResult.message,
      cc: cc,
      bin: getBin(cc),
      key: Math.random().toString(36).substring(7),
      balance: dbUser.balance - (checkResult.success ? checkerSettings.checkLiveCost : 0)
    });

  } catch (error) {
    console.error('Check error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function processCardCheck(cc, gateway_server) {
  // Implementar lógica de check do cartão
  // Retornar { success: true/false, message: string }
}

async function updateUserAfterCheck(db, user, cc, result) {
  if (result.success) {
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $push: {
          logs: {
            $each: [{
              history_type: 'CARD CHECK',
              cost: -checkerSettings.checkLiveCost,
              data: cc,
              date: new Date()
            }],
            $position: 0
          }
        },
        $inc: { balance: -checkerSettings.checkLiveCost }
      }
    );
  }
}

function getBin(cc) {
  return cc.split('|')[0].substring(0, 6);
}
