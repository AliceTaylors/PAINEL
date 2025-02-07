import dbConnect from "./utils/dbConnect";
import User from "./models/User";
import crypto from "crypto";
import luhn from "fast-luhn";
import { checkToken } from "./utils/session";
import checkerSettings from "../../checkerSettings";
import Log from "./models/Log";
import { JSDOM } from "jsdom";
const axios = require("axios").default;
import dotenv from "dotenv";
import Check from "./models/Check";

dotenv.config();

const dateInPast = function (firstDate, secondDate) {
  if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0)) {
    return true;
  }

  return false;
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    await dbConnect();

    const { cc } = req.body;

    if (cc === null) {
      return res.send({
        success: false,
        return: "#ERROR",
        key: crypto.randomUUID(),
        cc,
        bin: "Enter valid CC. Correct format: CC|MM|YYYY|CVV",
      });
    }

    const { token } = req.headers;

    const validToken = checkToken(token);

    const user = await User.findOne({ _id: validToken.user._id });

    const log = await Log.findOne({ log: cc });

    if (!user) {
      return res.send({
        success: false,
        return: "#ERROR",
        cc,
        key: crypto.randomUUID(),
        bin: "Error",
      });
    }

    if (
      user.balance < checkerSettings.checkLiveCost * -1 ||
      user.balance == 0 ||
      user.balance < 0
    ) {
      return res.send({
        success: false,
        return: "#ERROR",
        key: crypto.randomUUID(),
        cc,
        bin: "Insufficient funds to check cards. Recharge now in checkercc.tech!",
      });
    }

    if (
      user.balance < checkerSettings.checkLiveCost * -1 ||
      user.balance == 0 ||
      user.balance < 0
    ) {
      return res.send({
        success: false,
        return: "#ERROR",
        key: crypto.randomUUID(),
        cc,
        bin: "Insufficient funds to check cards. Topup your account now on checkercc.tech!",
      });
    }

    let [number, month, year, cvv] = cc
      .replace(":", "|")
      .replace("/", "|")
      .split("|");

    var len = number.length,
      bit = 1,
      sum = 0,
      val;

    while (len) {
      val = parseInt(number.charAt(--len), 10);
      sum += (bit ^= 1) ? [0, 2, 4, 6, 8, 1, 3, 5, 7, 9][val] : val;
    }

    const validCard = sum && sum % 10 === 0;

    if (!validCard) {
      return res.send({
        success: false,
        return: "#DIE",
        key: crypto.randomUUID(),
        cc,
        ccFormated: { number, month, year, cvv },
        bin: "INVALID CARD",
      });
    }

    const formatedExpiration = new Date(`${year}-${month}-01`);
    if (dateInPast(formatedExpiration, new Date())) {
      return res.send({
        success: false,
        return: "#ERROR",
        key: crypto.randomUUID(),
        cc,
        bin: `CARD EXPIRED ON ${formatedExpiration.toLocaleDateString()}`,
      });
    }

    let bin = "";
    try {
      const binUrl =
        "https://bins.ws/search?bins=" + String(number).slice(0, 6);
      bin = await axios
        .get(binUrl, {
          headers: { "Accept-Version": "3" },
        })
        .catch((err) => err);
      let binData = bin.data;

      binData = new JSDOM(binData);
      binData =
        binData.window.document.querySelector(".page tbody tr").textContent;
      let binInfo = binData.split("\n");
      binInfo = binInfo.filter((i) => i);
      let binObject = {
        bin: binInfo[0],
        type: binInfo[1],
        level: binInfo[2],
        brand: binInfo[3],
        bank: binInfo[4],
        country: binInfo[5],
      };

      bin = `${binObject.type} / ${binObject.level} / ${binObject.bank} / #${binObject.country}`;
    } catch (error) {
      bin = "UNKNOWN BIN!";
    }

    if (log) {
      await user.updateOne({
        logs: [
          {
            history_type: "- LIVE CARD" + cc,
            cost: checkerSettings.checkLiveCost,
          },
          ...user.logs,
        ],
        $inc: {
          balance: checkerSettings.checkLiveCost,
        },
      });
      return res.send({
        success: true,
        return: "#LIVE",
        key: crypto.randomUUID(),
        cc,
        ccFormated: { number, month, year, cvv },
        bin,
      });
    }

    const API_URL = process.env.API_1_URL;
    const API_RESULT = await axios.get(API_URL + cc);

    if (API_RESULT.data.error) {
      return res.send({
        success: false,
        return: "#ERROR",
        key: crypto.randomUUID(),
        cc,
        bin: `ERROR ADYEN API (EXPIRED?)`,
      });
    }

    if (API_RESULT.data.live & (user.balance > checkerSettings.checkLiveCost)) {
      await Log.create({
        date: new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
        }),
        log: "LIVE CC:" + cc,
      });

      await Check.create({
        number: cc,
        result: "LIVE",
        bin,
      });

      await user.updateOne({
        logs: [
          {
            history_type: "LIVE CARD",
            cost: checkerSettings.checkLiveCost,
            data: cc,
          },
          ...user.logs,
        ],
        $inc: {
          balance: checkerSettings.checkLiveCost,
        },
      });
      res.send({
        success: true,
        return: "#LIVE",
        key: crypto.randomUUID(),
        cc,
        ccFormated: { number, month, year, cvv },
        bin,
      });
    } else {
      res.send({
        success: false,
        return: "#DIE",
        key: crypto.randomUUID(),
        cc,
        ccFormated: { number, month, year, cvv },
        bin,
      });
    }
  } else {
    res.send({ ok: true });
  }
}
