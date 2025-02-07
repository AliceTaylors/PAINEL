import Card from "../models/Card";
import User from "../models/User";
import dbConnect from "../utils/dbConnect";
import { checkToken } from "../utils/session";
import { searchBIN } from "./bin";

export default async function handler(req, res) {
  const { token } = req.headers;
  if (!token) return res.send({ error: "Unauthorized" });

  const validToken = checkToken(token);
  if (!validToken) return res.send({ error: "Unauthorized" });

  const user = await User.findOne({ _id: validToken.user._id });
  if (user.admin == false) return res.send({ error: "Unauthorized" });

  const { cards } = req.body;

  if (!cards) {
    return res.send({ error: "Missing cards." });
  }

  await dbConnect();

  const cardList = String(cards)
    .split("\n")
    .filter((cc) => cc.trim() !== "");

  cardList.map(async (card) => {
    const [num, mm, yyyy, cvv] = card.split("|");
    const bin = await searchBIN(card.split("|")[0].slice(0, 6));

    await Card.create({
      number: num,
      data: `${mm}/${yyyy} . CVV: ${cvv}`,
      pin: "",
      bin,
      price: 15.0,
    });
  });

  res.send({ ok: true });
}
