import dbConnect from "./utils/dbConnect";
import User from "./models/User";
import { createToken } from "./utils/session";
import Log from "./models/Log";
import checkerSettings from "../../checkerSettings";

function isAlphaNumeric(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (
      !(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)
    ) {
      // lower alpha (a-z)
      return false;
    }
  }
  return true;
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

    let user = await User.findOne({ login });

    if (user) {
      return res.send({ error: "User alredy exists!" });
    }

    const usersWithSameIP = await User.find({
      ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    });

    user = await User.create({
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
        },
      ],
    });

    await Log.create({
      date: new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
      log: `NEW USER: User: ${user.login} Telegram: ${user.mail || "-"}`,
    });

    return res.send({
      success: true,
      token: createToken({ user: { _id: user._id } }),
    });
  }
}
