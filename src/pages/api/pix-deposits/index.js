import { createPixDeposit, getPixDeposit } from "../../../services/mercadopago";
import dbConnect from "../../../utils/dbConnect";
import { checkToken } from "../../../utils/session";
import PixDeposit from "../../../models/PixDeposit";
import User from "../../../models/User";
import Log from "../../../models/Log";

export default async function handler(req, res) {
  await dbConnect();

  const { token } = req.headers;
  const validToken = checkToken(token);
  if (!validToken) return res.send({ error: "Not allowed" });

  // Resto da lógica de PIX...
} 