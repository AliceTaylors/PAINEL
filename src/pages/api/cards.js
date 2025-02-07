import Card from "./models/Card";
import Log from "./models/Log";
import User from "./models/User";
import Login from "./models/Log";
import { checkToken } from "./utils/session";

export default async function handler(req, res) {
  if (req.method == "POST") {
    const { id } = req.body;
    const { token } = req.headers;
    const validToken = checkToken(token);

    if (!validToken) {
      return res.send({ error: "Not allowed" });
    }

    const user = await User.findOne({ _id: validToken.user._id });

    const card = await Card.findOne({ pin: id });

    if (!user || !card) {
      return res.send({ error: "Not found" });
    }

    if (user.balance < card.price) {
      return res.send({ error: "Insufficient funds. Add funds now!" });
    }

    await user.updateOne({
      logs: [
        {
          history_type: "CARD PURCHASE",
          data:
            "" +
            card.number +
            " . " +
            card.data +
            "  |" +
            card.bin +
            " | " +
            card.pin +
            " CHECKERCC.SITE",
          cost: card.price * -1,
        },
        ...user.logs,
      ],
      $inc: { balance: card.price * -1 },
    });

    await card.deleteOne();

    await Log.create({
      date: new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
      log: `CARD SELL User: ${user.login} Telegram: ${user.mail} $${card.price}`,
    });
    return res.send({ card });
  } else {
    const { q } = req.query;

    let cards;
    if (q) {
      cards = await Card.find({ bin: { $regex: q, $options: "i" } });
    } else {
      cards = await Card.find({});
    }

    const formatedCards = [];

    if (!cards) {
      return res.send([]);
    }

    for (const card of cards) {
      const { number, data, pin, bin, price } = card;
      formatedCards.push({
        number:
          number.length == 16
            ? number.slice(0, 6) + "XXXXXXXXXX"
            : number.slice(0, 6) + "XXXXXXXXX",
        data,
        pin,
        bin,
        price,
      });
    }
    res.send(formatedCards);
  }
}
