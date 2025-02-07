import { checkTransactionStatus } from "../../services/coinbase";
import {
  availablePlisioCurrencies,
  createCharge,
  getChargeStatus,
} from "../../services/plisio";
import Log from "./models/Log";
import User from "./models/User";
import dbConnect from "./utils/dbConnect";
import { checkToken } from "./utils/session";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method == "POST") {
    const { token } = req.headers;

    const { amount, currency } = req.body;

    if (String(amount) == "") {
      return res.send({ error: "Enter valid amount" });
    }

    if (isNaN(amount)) {
      return res.send({ error: "Enter valid amount" });
    }

    if (parseFloat(amount) < 5) {
      return res.send({ error: "Minimum deposit: 5.00 USD" });
    }

    if (!currency || !availablePlisioCurrencies.includes(currency)) {
      return res.send({ error: "Invalid currency" });
    }

    const validToken = checkToken(token);

    if (!validToken) return res.send({ error: "Not allowed" });

    const user = await User.findOne({ _id: validToken.user._id });

    if (!user) return res.send({ error: "Unknown error" });

    // const coinbaseOrder = await createCharge({
    //   username: user.login,
    //   amount,
    //   userId: user._id,
    // });

    const newOrder = await createCharge({
      username: user.login,
      amount,
      currency,
      userId: user._id,
    });

    const order = {
      amount,
      complete: false,
      currency,
      address: newOrder.wallet_hash,
      pricing: newOrder.amount,
      externalId: newOrder.txn_id,
    };

    await Log.create({
      date: new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
      log: `NEW ORDER: User: ${user.login} Telegram: ${
        user.mail || ""
      } +${parseFloat(order.amount).toFixed(2)} USD`,
    });
    await User.updateOne(
      { _id: user._id },
      {
        order,
      }
    );

    res.send({ order });
  } else if (req.method == "GET") {
    const { token } = req.headers;

    const validToken = checkToken(token);

    if (!validToken) {
      return res.send({ error: "Not allowed" });
    }

    const user = await User.findOne({ _id: validToken.user._id });

    if (parseFloat(user.order.amount) < 5) {
      return res.send({ order: null });
    }

    const orderStatus = await getChargeStatus(user.order.externalId);

    if (orderStatus == "completed") {
      await User.updateOne(
        { _id: user._id },
        {
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
              history_type: "DEPOSIT",
              data: "$" + user.order.amount,
              cost: user.order.amount,
            },
            ...user.logs,
          ],
          $inc: {
            balance: parseFloat(user.order.amount).toFixed(2),
          },
        }
      );

      console.log(
        `RECEBIMENTO! Adicionado ${parseFloat(amount + bonusAmount).toFixed(
          2
        )} para ${user.login}`
      );

      await Log.create({
        date: new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        }),
        log: `PAID ORDER: User: ${user.login} +USD ${user.order.amount}`,
      });

      return res.send({ order: user.order });
    }

    if (
      orderStatus === "cancelled" ||
      orderStatus == "expired" ||
      orderStatus == "error"
    ) {
      await User.updateOne(
        { _id: validToken.user._id },
        {
          order: {
            amount: 0,
            complete: false,
            currency: "",
            address: "",
            pricing: "",
            externalId: "",
          },
        }
      );

      return res.send({
        order: {
          amount: 0,
          complete: false,
          currency: "",
          address: "",
          pricing: "",
          externalId: "",
        },
      });
    }

    return res.send({ order: user.order, status: orderStatus });
  } else if (req.method == "PUT") {
    const { token } = req.headers;

    const validToken = checkToken(token);

    if (!validToken) {
      return res.send({ error: "Not allowed" });
    }

    let user = await User.findOneAndUpdate(
      { _id: validToken.user._id },
      {
        order: {
          amount: 0,
          complete: false,
          currency: "",
          address: "",
          pricing: "",
          externalId: "",
        },
      }
    );

    if (!user) return res.send({ error: "Internal error" });

    await Log.create({
      date: new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
      log: `CANCEL ORDER: User: ${user.login} Telegram: ${
        user.mail || ""
      } -USD${parseFloat(user.order.amount).toFixed(2)}`,
    });

    res.send({ order: user.order });
  }
}
