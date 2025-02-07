import { createPixDeposit, getPixDeposit } from "../../services/mercadopago";
import dbConnect from "../api/utils/dbConnect";
import { checkToken } from "../api/utils/session";
import PixDeposit from "../api/models/PixDeposit";
import User from "../api/models/User";
import Log from "./models/Log";

export default async function handler(req, res) {
  await dbConnect();

  const { token } = req.headers;
  const validToken = checkToken(token);
  if (!validToken) return res.send({ error: "Not allowed" });

  const user = await User.findOne({ _id: validToken.user._id });
  if (!user) return res.send({ error: "Not allowed" });

  if (req.method == "POST") {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) return res.send({ error: "Missing amount" });

    const externalDeposit = await createPixDeposit(parseFloat(amount));

    const pixDeposit = await PixDeposit.create({
      userId: user.id,
      externalDepositId: externalDeposit.id,
      externalDepositAddress: externalDeposit.qrCode,
      amount: parseFloat(amount),
      status: externalDeposit.status,
    });

    await Log.create({
      date: new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
      log: `NEW PIX ORDER: User: ${user.login}  +${parseFloat(amount).toFixed(
        2
      )} BRL`,
    });

    return res.send({ pixDeposit });
  }

  if (req.query.id) {
    const pixDeposit = await PixDeposit.find({
      userId: user._id,
      _id: req.query.id,
    });
    if (!pixDeposit) {
      return res.send({ error: "PIX Deposit not found" });
    }

    const externalPayment = await getPixDeposit(
      pixDeposit[0].externalDepositId
    );

    if (externalPayment.status == "approved") {
      await User.updateOne(
        { _id: user._id },
        {
          $inc: {
            balance: parseFloat(pixDeposit[0].amount).toFixed(2),
          },
        }
      );

      await Log.create({
        date: new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        }),
        log: `PAID ORDER: User: ${user.login}  +${parseFloat(
          pixDeposit[0].amount
        ).toFixed(2)} BRL (PIX)`,
      });

      await PixDeposit.deleteOne({ _id: pixDeposit[0]._id });
      return res.send({
        pixDeposit: { ...pixDeposit[0]._doc, status: externalPayment.status },
      });
    }

    await PixDeposit.updateOne(
      { _id: pixDeposit[0]._id },
      { status: externalPayment.status }
    );

    return res.send({
      pixDeposit: { ...pixDeposit[0]._doc, status: externalPayment.status },
    });
  }

  // get transactions
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const pixDeposits = await PixDeposit.find({
    $or: [
      { createdAt: { $gt: oneDayAgo } },
      { createdAt: { $lte: oneDayAgo }, status: "approved" },
    ],
  })
    .sort({ _id: -1 })
    .exec();

  return res.send({ pixDeposits });
}
