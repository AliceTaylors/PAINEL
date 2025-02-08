import dbConnect from "../../utils/dbConnect";
import { createToken } from "../../utils/auth";
import checkerSettings from "../../checkerSettings";

function isAlphaNumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await dbConnect();

      const { login, password, mail } = req.body;

      if (!isAlphaNumeric(login)) {
        return res.send({
          error: "Invalid! Please enter a valid username. Ex.: Dev4nonymous",
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

      // Criar novo usuário com estrutura original
      const newUser = await db.collection('users').insertOne({
        login,
        password,
        mail,
        balance: usersWithSameIP.length > 0 ? 0 : checkerSettings.startCredits,
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

      // Criar token com o ID correto
      const token = createToken({ user: { _id: newUser.insertedId } });

      // Registrar log de criação
      await db.collection('logs').insertOne({
        date: new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        }),
        log: `NEW USER: User: ${login} Telegram: ${mail || "-"}`,
      });

      return res.send({
        success: true,
        token
      });

    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ 
        error: "Internal server error. Please try again."
      });
    }
  }
}
