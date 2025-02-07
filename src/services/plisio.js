import axios from "axios";
import dotenv from "dotenv";
import crypto, { randomUUID } from "node:crypto";

const PLISIO_API_URL = "https://plisio.net/api/v1";
const PLISIO_API_KEY = process.env.PLISIO;

export const availablePlisioCurrencies = ["BTC", "ETH", "LTC", "DOGE"];

function objectToQueryString(obj) {
  return Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join("&");
}

export async function createCharge({ username, amount, currency, userId }) {
  const data = {
    source_currency: "USD",
    source_amount: String(amount),
    order_number: crypto.randomUUID() + "#/" + userId,
    currency,
    email: "customer@plisio.net",
    order_name: crypto.randomUUID() + `Recarga p/ ${username}`,
    callback_url: "http://test.com/callback?p=" + randomUUID(),
    api_key: PLISIO_API_KEY,
  };
  const res = await axios
    .get(PLISIO_API_URL + "/invoices/new?" + objectToQueryString(data))
    .catch((err) => console.log(err));

  return res.data.data;
}

export async function getChargeStatus(id) {
  const res = await axios.get(
    PLISIO_API_URL + "/operations/" + id + "?api_key=" + PLISIO_API_KEY
  );

  return res.data.data.status;
}
