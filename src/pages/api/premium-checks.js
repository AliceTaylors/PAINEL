export default async function handler(req, res) {
  if (req.method === "POST") {
    const { token } = req.headers;
    const { cc } = req.body;
    
    const validToken = checkToken(token);
    if (!validToken) {
      return res.send({ error: "Not allowed" });
    }

    const user = await User.findOne({ _id: validToken.user._id });
    if (!user) {
      return res.send({ error: "Not allowed" });
    }

    // Check minimum balance
    if (user.balance < 0.1) {
      return res.send({ error: "Insufficient funds" });
    }

    const API_URL = process.env.API_2_URL;
    const API_RESULT = await axios.get(API_URL + cc);

    if (API_RESULT.data.error) {
      // Charge for die
      await user.updateOne({
        logs: [
          {
            history_type: "PREMIUM DIE",
            cost: -0.1,
            data: cc,
          },
          ...user.logs,
        ],
        $inc: {
          balance: -0.1,
        },
      });

      return res.send({
        success: false,
        return: API_RESULT.data.retorno,
        key: crypto.randomUUID(),
        cc,
      });
    }

    if (API_RESULT.data.success) {
      // Check balance for live cost
      if (user.balance < 1.0) {
        return res.send({ error: "Insufficient funds for live check" });
      }

      await user.updateOne({
        logs: [
          {
            history_type: "PREMIUM LIVE",
            cost: -1.0,
            data: cc,
          },
          ...user.logs,
        ],
        $inc: {
          balance: -1.0,
        },
      });

      return res.send({
        success: true,
        return: API_RESULT.data.retorno,
        key: crypto.randomUUID(),
        cc,
      });
    }
  }
} 
