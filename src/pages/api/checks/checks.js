import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    const { token, cc } = req.query;

    // Verificar token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Resto da lógica do checker
    // ...

  } catch (error) {
    console.error('Error in checker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
