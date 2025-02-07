import Log from './models/Log';
import User from './models/User';
export default async function handler(req, res) {
  try {
    const event = req.body.event;

    const status = event.data.timeline[event.data.timeline.length - 1].status;

    const context =
      event.data.timeline[event.data.timeline.length - 1].context || '';

    console.log(
      `Webhook: ${status} ${context && '| ' + context + ' | '} USD ${
        event.data.pricing.local.amount
      }`
    );

    if (status == 'EXPIRED') {
      const user = await User.findOne({ 'order.kamoneyId': event.data.id });

      if (!user) {
        return res.send({});
      }

      await User.updateOne(
        { _id: user._id },
        {
          order: {
            amount: 0,
            address: '',
            addresses: [],
            pricing: [],
            complete: false,
            kamoneyId: '',
          },
        }
      );

      await Log.create({
        date: new Date().toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        }),
        log: `EXPIRED ORDER User: ${user.login} USD ${user.order.amount}`,
      });

      return res.send({ ok: true });
    } else if (status === 'COMPLETED' || context == 'OVERPAID') {
      // Lógica para lidar com o pagamento concluído
      const amount = event.data.pricing.local.amount;

      const user = await User.findOne({ 'order.kamoneyId': event.data.id });

      if (!user) {
        return res.send({});
      }

      const bonusAmount = parseFloat((60 / 100) * parseFloat(amount)).toFixed(
        2
      );

      await User.updateOne(
        { _id: user._id },
        {
          order: {
            amount: 0,
            address: '',
            addresses: [],
            pricing: [],
            complete: false,
            kamoneyId: '',
          },
          logs: [
            {
              history_type: 'DEPOSIT',
              data: '$' + amount,
              cost: amount,
            },
            ...user.logs,
          ],
          $inc: {
            balance: parseFloat(amount + bonusAmount).toFixed(2),
          },
        }
      );

      console.log(
        `RECEBIMENTO! Adicionado ${parseFloat(amount + bonusAmount).toFixed(
          2
        )} para ${user.login}`
      );

      await Log.create({
        date: new Date().toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        }),
        log: `PAID ORDER: User: ${user.login} +USD ${user.order.amount}`,
      });

      return res.send({ ok: true });
    }

    return res.send({ ok: true });
  } catch (error) {
    console.error('Erro ao processar a notificação:', error);
    return res.status(500).send({ error: 'Erro interno do servidor' });
  }
}
