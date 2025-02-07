import Log from "../models/Log";
import User from "../models/User";
import dbConnect from "../utils/dbConnect";
import { checkToken } from "../utils/session";

export default async function handler(req, res) {
  const { username, amount } = req.body;

  const { token } = req.headers;
  if (!token) return res.send({ error: "Unauthorized" });

  const validToken = checkToken(token);
  if (!validToken) return res.send({ error: "Unauthorized" });

  const user = await User.findOne({ _id: validToken.user._id });
  if (user.admin == false) return res.send({ error: "Unauthorized" });

  if (!username || !amount) {
    return res.send({ error: "Missing username or amount" });
  }

  await dbConnect();

  const targetUser = await User.findOne({ login: username });

  if (!targetUser) {
    return res.send({ error: "User not found" });
  }

  await User.updateOne(
    { _id: targetUser._id },
    {
      order: {
        amount: 0,
        address: "",
        addresses: [],
        pricing: [],
        complete: false,
        kamoneyId: "",
      },
      logs: [
        {
          history_type: "DEPOSIT",
          data: "$" + amount,
          cost: amount,
        },
        ...targetUser.logs,
      ],
      $inc: {
        balance: parseFloat(amount).toFixed(2),
      },
    }
  );

  res.send({ ok: true });
}
