import dbConnect from "./utils/dbConnect";
import User from "./models/User";
import { createToken } from "./utils/session";
import Log from "./models/Log";
import checkerSettings from "../../checkerSettings";

function isAlphaNumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    await dbConnect();

    const { login, password, mail } = req.body;

    if (!isAlphaNumeric(login)) {
      return res.send({
        error: "Invalid! Please enter a valid username. Ex.: crazy8",
      });
    }

    if (!login || !password) {
      return res.send({ error: "Fill all fields." });
    }

    if (String(login).length > 16) {
      return res.send({ error: "Username must be 16 characters maximum" });
    }

    const db = global.mongoose.connection.db;
    let user = await db.collection('users').findOne({ login });

    if (user) {
      return res.send({ error: "User already exists!" });
    }

    const usersWithSameIP = await db.collection('users').find({
      ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    }).toArray();

    // Criar novo usuário
    user = await db.collection('users').insertOne({
      login,
      password,
      mail,
      balance: usersWithSameIP.length > 0 ? 0 : 5.00, // 5.00 créditos iniciais se for primeiro usuário do IP
      ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      order: {
        amount: 0,
        complete: false,
        currency: "",
        address: "",
        pricing: "",
        externalId: "",
      },
      logs: [
        {
          history_type: "WALLET CREATED",
          data: "We hope you enjoy it all!",
          cost: 0,
          date: new Date()
        },
      ],
    });

    // Registrar log de criação
    await db.collection('logs').insertOne({
      date: new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
      log: `NEW USER: User: ${login} Telegram: ${mail || "-"}`,
    });

    return res.send({
      success: true,
      token: createToken({ user: { _id: user.insertedId } }),
    });
  }
}
