import { Payment, MercadoPagoConfig } from "mercadopago";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';

// Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO,
  options: { timeout: 5000, idempotencyKey: uuidv4() },
});

// Função para obter cotação atual do dólar
async function getDollarRate() {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    return response.data.rates.BRL;
  } catch (error) {
    console.error('Error getting dollar rate:', error);
    return 5; // Taxa de fallback caso a API falhe
  }
}

export async function createPixDeposit(amount) {
  // Obtém a cotação atual do dólar
  const dollarRate = await getDollarRate();
  const amountInUSD = (amount / dollarRate).toFixed(2);

  const deposit = await new Payment(client).create({
    body: {
      transaction_amount: amount,
      description: `Recarga de R$${amount} (≈ $${amountInUSD})`,
      payment_method_id: "pix",
      payer: {
        email: uuidv4().split("-")[0] + "@gmail.com",
      },
    },
  });

  return {
    id: deposit.id,
    qrCode: deposit.point_of_interaction.transaction_data.qr_code,
    status: deposit.status,
    amountBRL: amount,
    amountUSD: amountInUSD,
    dollarRate
  };
}

export async function getPixDeposit(id) {
  const res = await axios.get("https://api.mercadopago.com/v1/payments/" + id, {
    headers: {
      Authorization: "Bearer " + process.env.NEXT_PUBLIC_MERCADOPAGO,
    },
  });

  const deposit = res.data;
  const dollarRate = await getDollarRate();
  const amountUSD = (deposit.transaction_amount / dollarRate).toFixed(2);

  return {
    id: deposit.id,
    qrCode: deposit.point_of_interaction.transaction_data.qr_code,
    status: deposit.status,
    amountBRL: deposit.transaction_amount,
    amountUSD: amountUSD,
    dollarRate
  };
}
