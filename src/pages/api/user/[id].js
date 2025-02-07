import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import { validateUser } from '../../../utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { id } = req.query;

    const user = await validateUser(id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    switch (req.method) {
      case 'GET':
        return res.json({ user });
      
      case 'POST':
        const { action } = req.body;
        // Implementar ações do usuário aqui
        return res.json({ success: true });
        
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('User API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 