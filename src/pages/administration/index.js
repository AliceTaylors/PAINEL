import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import Log from '../../../models/Log';
import jwt from 'jsonwebtoken';

// Função para verificar token de admin
const checkAdminToken = (token) => {
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, "CHAVEZAOPRIVADO");
    return decoded.user.role === 'admin';
  } catch {
    return false;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { token } = req.headers;
    const { action, targetId, amount } = req.query;

    // Verificar se é um admin
    const isAdmin = checkAdminToken(token);
    if (!isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Buscar usuário alvo
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    switch (action) {
      case 'ADD_BALANCE':
        // Adicionar saldo
        await targetUser.updateOne({
          logs: [
            {
              history_type: "BALANCE_ADDED",
              data: `Admin added $${amount} to balance`,
              cost: amount,
              date: new Date()
            },
            ...targetUser.logs
          ],
          $inc: { balance: amount }
        });

        // Registrar log da operação
        await Log.create({
          date: new Date().toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          }),
          log: `BALANCE ADDED: $${amount} to user ${targetUser.login} (${targetUser._id})`
        });

        return res.json({ 
          success: true, 
          message: 'Balance added successfully',
          newBalance: targetUser.balance + amount
        });

      case 'REMOVE_BALANCE':
        // Verificar se tem saldo suficiente
        if (targetUser.balance < amount) {
          return res.status(400).json({ 
            error: 'Insufficient balance' 
          });
        }

        // Remover saldo
        await targetUser.updateOne({
          logs: [
            {
              history_type: "BALANCE_REMOVED",
              data: `Admin removed $${amount} from balance`,
              cost: -amount,
              date: new Date()
            },
            ...targetUser.logs
          ],
          $inc: { balance: -amount }
        });

        // Registrar log da operação
        await Log.create({
          date: new Date().toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          }),
          log: `BALANCE REMOVED: $${amount} from user ${targetUser.login} (${targetUser._id})`
        });

        return res.json({
          success: true,
          message: 'Balance removed successfully',
          newBalance: targetUser.balance - amount
        });

      default:
        return res.status(400).json({ 
          error: 'Invalid action' 
        });
    }

  } catch (error) {
    console.error('Admin operation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 
