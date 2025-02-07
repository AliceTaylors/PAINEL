// Remover a importação do crypto
// import crypto, { randomUUID } from "node:crypto";
import { v4 as uuidv4 } from 'uuid';

export async function createCharge({ username, amount, currency, userId }) {
  const data = {
    source_currency: "USD",
    source_amount: String(amount),
    order_number: uuidv4() + "#/" + userId,  // Usar uuidv4
    currency,
    email: "customer@plisio.net",
    order_name: uuidv4() + `Recarga p/ ${username}`,  // Usar uuidv4
    callback_url: "http://test.com/callback?p=" + uuidv4(),  // Usar uuidv4
    api_key: PLISIO_API_KEY,
  };
  // ... resto do código ...
} 