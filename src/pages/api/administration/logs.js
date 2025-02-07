import Log from "../models/Log";
import User from "../models/User";
import dbConnect from "../utils/dbConnect";
import { checkToken } from "../utils/session";
export default async function handler(req, res) {
  const { token } = req.headers;
  if (!token) return res.send({ error: "Unauthorized" });

  const validToken = checkToken(token);
  if (!validToken) return res.send({ error: "Unauthorized" });

  const user = await User.findOne({ _id: validToken.user._id });
  if (user.admin == false) return res.send({ error: "Unauthorized" });

  await dbConnect();
  const logs = await (
    await Log.find({}, null, { sort: { _id: -1 } })
  ).filter(
    (r) => !String(r.log).includes("|") & !String(r.log).includes("LIVE")
  );

  res.send({ logs });
}
