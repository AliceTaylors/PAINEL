import axios from 'axios';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from "./utils/dbConnect";
import User from "./models/User";
import Log from "./models/Log";
import Check from "./models/Check";
import checkerSettings from "./utils/checkerSettings";
import { JSDOM } from "jsdom";
import dotenv from "dotenv";

dotenv.config();

const dateInPast = function (firstDate, secondDate) {
  if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0)) {
    return true;
  }

  return false;
};

// Função simplificada para verificar token
const checkToken = (token) => {
  if (!token) return false;
  try {
    return jwt.verify(token, "CHAVEZAOPRIVADO");
  } catch {
    return false;
  }
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    await dbConnect();

    const { cc, checker = 'adyen' } = req.body;
    const { token } = req.headers;

    if (!cc) {
      return res.send({
        success: false,
        return: "#ERROR",
        key: uuidv4(),
        message: "Missing card data"
      });
    }

    try {
      const validToken = checkToken(token);
      const user = await User.findOne({ _id: validToken.user._id });

      if (!user) {
        return res.send({
          success: false,
          return: "#ERROR",
          key: uuidv4(),
          message: "User not found"
        });
      }

      // Verificar custos baseado no tipo de checker
      const checkCost = checker === 'premium' ? 
        { live: 1.0, die: 0.1 } : // Premium: $1.00 por live, $0.10 por die
        { live: 0.5, die: 0.0 };  // Adyen: $0.50 por live, $0.00 por die

      // Verificar saldo
      if (user.balance < checkCost.live) {
        return res.send({
          success: false,
          return: "#ERROR",
          key: uuidv4(),
          message: "Insufficient balance"
        });
      }

      // Verificar contagem de dies seguidos (agora para ambos os checkers)
      const recentLogs = user.logs.slice(0, 20);
      const consecutiveDies = recentLogs.filter(log => 
        log.history_type.includes("DIE CARD") && 
        new Date(log.date) > new Date(Date.now() - 24*60*60*1000) // Últimas 24h
      ).length;

      if (consecutiveDies >= 20) {
        // Bloquear usuário independente do checker usado
        await user.updateOne({
          blocked: true,
          blockReason: "20 consecutive dies detected"
        });

        return res.send({
          success: false,
          return: "#ERROR",
          key: uuidv4(),
          message: "Account blocked: Too many consecutive dies"
        });
      }

      // Extrair BIN do cartão
      const bin = cc.split('|')[0].substring(0, 6);
      
      // Consultar informações do BIN
      let binInfo = {};
      try {
        const binResponse = await axios.get(`https://lookup.binlist.net/${bin}`);
        binInfo = {
          bank: binResponse.data.bank?.name || '',
          type: binResponse.data.type?.toUpperCase() || '',
          level: binResponse.data.brand?.toUpperCase() || '',
          country: binResponse.data.country?.name || '',
          flag: binResponse.data.country?.emoji || ''
        };
      } catch (error) {
        console.error('BIN lookup error:', error);
      }

      // Fazer request para a API apropriada
      const API_URL = checker === 'premium' ? 
        process.env.API_2_URL : 
        process.env.API_1_URL;

      const API_RESULT = await axios.get(API_URL + cc);

      // Processar erros específicos do checker VIP
      if (checker === 'premium' && API_RESULT.data.error) {
        return res.send({
          error: true,
          return: "#ERROR",
          key: uuidv4(),
          cc,
          message: API_RESULT.data.retorno
        });
      }

      // Processar resultado
      if (API_RESULT.data.live) {
        await Log.create({
          date: new Date().toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          }),
          log: `LIVE CC (${checker.toUpperCase()}): ${cc}`
        });

        await Check.create({
          number: cc,
          result: "LIVE",
          checker: checker.toUpperCase()
        });

        await user.updateOne({
          logs: [
            {
              history_type: `LIVE CARD (${checker.toUpperCase()})`,
              cost: -checkCost.live,
              data: cc,
              date: new Date()
            },
            ...user.logs
          ],
          $inc: { balance: -checkCost.live }
        });

        return res.send({
          success: true,
          return: "#LIVE",
          key: uuidv4(),
          cc,
          bin,
          ...binInfo,
          retorno: checker === 'premium' ? "Payment Approved! [00]" : undefined
        });
      } else {
        await user.updateOne({
          logs: [
            {
              history_type: `DIE CARD (${checker.toUpperCase()})`,
              cost: -checkCost.die,
              data: cc,
              date: new Date()
            },
            ...user.logs
          ],
          $inc: { balance: -checkCost.die }
        });

        return res.send({
          success: false,
          return: "#DIE",
          key: uuidv4(),
          cc,
          bin,
          retorno: checker === 'premium' ? "Transaction Declined! [999]" : undefined
        });
      }

    } catch (error) {
      console.error('Error:', error);
      return res.send({
        success: false,
        return: "#ERROR",
        key: uuidv4(),
        message: error.message
      });
    }
  } else {
    res.send({ ok: true });
  }
}
