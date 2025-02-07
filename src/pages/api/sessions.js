import dbConnect from './utils/dbConnect';
import User from './models/User';
import { checkToken, createToken } from './utils/session';
import Log from './models/Log';

export default async function handler(req, res) {
  if (req.method == 'POST') {
    await dbConnect();

    const { login, password } = req.body;

    if (!login || !password) {
      return res.send({ error: 'Invalid credentials!' });
    }

    const user = await User.findOne({ login, password });

    if (!user) {
      return res.send({ error: 'Invalid credentials!' });
    }

    await Log.create({
      date: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
      log: `LOGIN User: ${user.login} Telegram: ${user.mail}`,
    });
    return res.send({
      success: true,
      token: createToken({ user: { _id: user._id } }),
    });
  } else if (req.method == 'GET') {
    await dbConnect();

    const { token } = req.headers;

    if (!token) {
      return res.send({ error: 'Not allowed' });
    }

    const validToken = checkToken(token);

    if (!validToken) {
      return res.send({ error: 'Not allowed' });
    }

    const user = await User.findById(validToken.user._id);

    if (!user) {
      return res.send({ error: 'Not allowed' });
    }

    return res.send({ user });
  } else {
    return res.send({ ok: true });
  }
}
