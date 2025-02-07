import RedeemCode from './models/RedeemCode';
import User from './models/User';
import dbConnect from './utils/dbConnect';
import { checkToken } from './utils/session';
import crypto from 'node:crypto';

export default async function handler(req, res) {
 

  if (req.method == 'POST') {
    await dbConnect();
    const { token } = req.headers;

    const { code } = req.body;

    const validToken = checkToken(token);

    if (!validToken) return res.send({ error: 'Not allowed' });

    const user = await User.findOne({ _id: validToken.user._id });

    if (!user) return res.send({ error: 'Not allowed' });

    const codeQuery = await RedeemCode.findOne({ code });

    if (!codeQuery) return res.send({ error: 'Invalid redeem code' });

    await user.updateOne({
      $inc: {
        balance: codeQuery.amount,
      },
    });

    await codeQuery.delete();

    res.send({ success: true, amount: codeQuery.amount });
  } else {
    res.send({ ok: true });
  }
}
