import { Payment, MercadoPagoConfig } from "mercadopago";
import crypto from "node:crypto";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

// Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO,
  options: { timeout: 5000, idempotencyKey: crypto.randomUUID() },
});

export async function createPixDeposit(amount) {
  const deposit = await new Payment(client).create({
    body: {
      transaction_amount: amount,
      description: "Recarga de R$" + amount,
      payment_method_id: "pix",
      payer: {
        email: crypto.randomUUID().split("-")[0] + "@gmail.com",
      },
    },
  });

  return {
    id: deposit.id,
    qrCode: deposit.point_of_interaction.transaction_data.qr_code,
    status: deposit.status,
  };
}

export async function getPixDeposit(id) {
  const res = await axios.get("https://api.mercadopago.com/v1/payments/" + id, {
    headers: {
      Authorization: "Bearer " + process.env.MERCADOPAGO,
    },
  });

  const deposit = res.data;

  return {
    id: deposit.id,
    qrCode: deposit.point_of_interaction.transaction_data.qr_code,
    status: deposit.status,
  };
}
